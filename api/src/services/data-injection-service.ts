import { readFileSync } from "fs";
import Papa from "papaparse";
import { db } from "../data";
import { DataInjectionSource } from "src/data/models";

export class DataInjectionService {
  async insertCsvFromFilePath(filePath: string, sourceId: number) {
    const source = await this.getSourceOrThrow(sourceId);

    const rows = this.validateAndParseCSVData(source.source_name,filePath);
    if (rows.length === 0) {
      throw new Error("No valid data found in the CSV file.");
    }

    const mappings = await db("data_injection_mappings").where({ source_id: sourceId });

    for (const row of rows) {
      const transformed = this.transformRow(row, mappings, source.source_name, sourceId);
      await db("data_injections").insert(transformed);
    }
  }

  async clearDataInjections(sourceId: number) {
    await db("data_injections").where({ source_id: sourceId }).delete();
  }

private async getSourceOrThrow(sourceId: number): Promise<DataInjectionSource> {
  const source = await db("data_injection_sources").where({ id: sourceId }).first();
  if (!source) throw new Error(`Unknown source ID: ${sourceId}`);
  return source;
}

private validateAndParseCSVData(sourceName: string, csvPath: string): Record<string, string>[] {
  const csv = readFileSync(csvPath, "utf-8");
  const lines = csv.split(/\r?\n/);

  let headerIndex: number = -1;

  if (sourceName === "RL6") {
    headerIndex = lines.findIndex((line) => line.includes("File ID"));
    if (headerIndex === -1) {
      throw new Error("Header row with 'File ID' not found");
    }
  } else if (sourceName === "Vortex") {
    headerIndex = lines.findIndex((line) => line.includes("ID"));
    if (headerIndex === -1) {
      throw new Error("Header row with 'ID' not found");
    }
  } else if (sourceName === "Workhub") {
    headerIndex = lines.findIndex((line) => line.includes("Number"));
    if (headerIndex === -1) {
      throw new Error("Header row with 'Number' not found");
    }
  } else {
    throw new Error("Unknown source name");
  }

  const trimmedCsv = lines.slice(headerIndex).join("\n");

  const { data } = Papa.parse<Record<string, string>>(trimmedCsv, {
    header: true,
    skipEmptyLines: true,
  });

  return data;
}

private transformRow(
  row: Record<string, string>,
  mappings: any[],
  sourceName: string,
  sourceId: number
): Record<string, any> {
  const transformed: Record<string, any> = {
    source_id: sourceId,
    created_at: new Date(),
  };

  for (const mapping of mappings) {
    const value = row[mapping.source_attribute];
    if (value === undefined) continue;

    if (sourceName === "RL6" && mapping.target_attribute === "location_detail") {
      const current = transformed[mapping.target_attribute] || "";
      transformed[mapping.target_attribute] = current ? `${current}, ${value}` : value;
      continue;
    }

    if (mapping.source_value && value === mapping.source_value) {
      transformed[mapping.target_attribute] = mapping.target_value;
    } else if (!mapping.source_value) {
      transformed[mapping.target_attribute] = value;
    }
  }

  return transformed;
}

}
