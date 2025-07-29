import { promises as fs, readFileSync } from "fs";
import Papa from "papaparse";
import { db } from "../data";
import { DataInjectionSource, DataInjection } from "src/data/models";

function makeDataInjectionBase(
  sourceId: number,
  userId: number
): Omit<DataInjection, 'id'> {
  return {
    source_id:        sourceId,
    identifier:       "",
    incident_type_id: 5,
    status_code:      "NoAct",
    proxy_user_id:    userId,
    description:           "",
    description_moderated: "",
    urgency_code:         "",
    location_detail:      "",
    created_at:       new Date(),
  };
}

export class DataInjectionService {

  async insertCsvFromFilePath(
    filePath: string,
    sourceId: number,
    userId: number
  ): Promise<void> {
    const source = await this.getSourceOrThrow(sourceId);
    const rows = this.validateAndParseCSVData(source, filePath);

    if (rows.length === 0) {
      throw new Error("No valid data found in the CSV file.");
    }

    await this.clearDataInjections(source, rows);

    const mappings = await db("data_injection_mappings").where({ source_id: sourceId });

    const transformedRows = rows.map(row =>
      this.transformRow(row, mappings, source.source_name, sourceId, userId)
    );

    await db.transaction(async trx => {
      await trx.batchInsert("data_injections", transformedRows, 500);
    });
  }

  async clearDataInjections(
      source: DataInjectionSource,
      rows: Record<string, string>[]
    ): Promise<void> {
      const identifiers = rows
        .map(row => row[source.identifier_column_name])
        .filter((id): id is string => Boolean(id));

      if (identifiers.length === 0) {
        return;
      }

      await db("data_injections")
        .where({ source_id: source.id })
        .whereIn("identifier", identifiers)
        .delete();
    }

    private async getSourceOrThrow(
      sourceId: number
    ): Promise<DataInjectionSource> {
      const source = await db("data_injection_sources").where({ id: sourceId }).first();
      if (!source) throw new Error(`Unknown source ID: ${sourceId}`);
      return source;
    }

    private validateAndParseCSVData(
      source: DataInjectionSource,
      csvPath: string
    ): Record<string, string>[] {
      const csv = readFileSync(csvPath, "utf-8");
      const lines = csv.split(/\r?\n/);

      const headerIndex = lines.findIndex(line => line.includes(source.identifier_column_name));
      if (headerIndex === -1) {
        throw new Error(`Header row with '${source.identifier_column_name}' not found`);
      }

      const trimmedCsv = lines.slice(headerIndex).join("\n");
      const { data, meta } = Papa.parse<Record<string, string>>(trimmedCsv, {
        header: true,
        skipEmptyLines: true,
      });


      if (meta.fields?.length != source.column_count) {
        throw new Error("Invalid CSV format");
      }
      return data;
    }

    private transformRow(
      row: Record<string, string>,
      mappings: Array<{
        source_attribute: string;
        target_attribute: string;
        source_value?: string;
        target_value?: string;
      }>,
      sourceName: string,
      sourceId: number,
      userId: number
    ): DataInjection {
      const base = makeDataInjectionBase(sourceId, userId);
      const transformed: any = { ...base };

      mappings.forEach(({ source_attribute, target_attribute }) => {
        const raw = row[source_attribute];
        if (raw != null) {
          transformed[target_attribute] = raw;
        }
      });

      mappings.forEach(({ source_attribute, target_attribute, source_value, target_value }) => {
        const raw = row[source_attribute];
        if (raw == null) throw new Error(`Missing required attribute: ${source_attribute}. Invalid CSV format?`);

        if (sourceName === "RL6" && target_attribute === "location_detail") {
          const existing = transformed.location_detail || "";
          transformed.location_detail = existing
            ? `${existing}, ${raw}`
            : raw;
        } else if (
          source_value != null &&
          raw === source_value
        ) {
          transformed[target_attribute] = target_value;
        } else if (source_value == null) {
          transformed[target_attribute] = raw;
        }
      });

      return transformed as DataInjection;
    }
}


