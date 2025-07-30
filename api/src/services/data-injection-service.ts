import { promises as fs, readFileSync } from "fs";
import Papa from "papaparse";
import { db } from "../data";
import { DateTime } from "luxon";
import { DataInjectionSource, DataInjection, DataInjectionMapping } from "src/data/models";

function makeDataInjectionBase(source_id: number, user_id: number): Omit<DataInjection, "id"> {
  return {
    source_id: source_id,
    identifier: "",
    incident_type_id: 5,
    status_code: "NoAct",
    proxy_user_id: user_id,
    description: "",
    description_moderated: "",
    urgency_code: undefined,
    location_detail: "",
    created_at: new Date(),
  };
}

export class DataInjectionService {
  async insertCsvFromFilePath(
    csvBuffer: Buffer,
    source_id: number,
    user_id: number
  ): Promise<void> {
    const csvText = csvBuffer.toString("utf-8");

    const source = await this.getSourceOrThrow(source_id);
    const rows = this.parseAndValidateCsv(source, csvText);

    await this.clearDataInjections(source, rows);
    const mappings = await db("data_injection_mappings").where({ source_id });
    const transformed = rows.map((row) => this.transformRow(row, mappings, source, user_id));
    await db.transaction((trx) => trx.batchInsert("data_injections", transformed, 500));
  }

  async clearDataInjections(
    source: DataInjectionSource,
    rows: Record<string, string>[]
  ): Promise<void> {
    const identifiers = rows
      .map((row) => row[source.identifier_column_name])
      .filter((id): id is string => Boolean(id));

    if (identifiers.length === 0) {
      return;
    }

    await db("data_injections")
      .where({ source_id: source.id })
      .whereIn("identifier", identifiers)
      .delete();
  }

  private async getSourceOrThrow(source_id: number): Promise<DataInjectionSource> {
    const source = await db("data_injection_sources").where({ id: source_id }).first();
    if (!source) throw new Error(`Unknown source ID: ${source_id}`);
    return source;
  }

  private parseAndValidateCsv(
    source: DataInjectionSource,
    csvText: string
  ): Record<string, string>[] {
    const lines = csvText.split(/\r?\n/);
    const headerIndex = lines.findIndex((l) => l.includes(source.identifier_column_name));
    if (headerIndex < 0) {
      throw new Error(`Header row with '${source.identifier_column_name}' not found`);
    }

    const trimmed = lines.slice(headerIndex).join("\n");
    const { data, meta } = Papa.parse<Record<string, string>>(trimmed, {
      header: true,
      skipEmptyLines: true,
    });

    if (meta.fields?.length !== source.column_count) {
      throw new Error("Invalid CSV format: wrong number of columns");
    }

    const validData = data.filter((r) => r[source.identifier_column_name]?.trim().length);

    if (validData.length === 0) {
      throw new Error("No valid data found in the CSV file.");
    }

    return validData;
  }

  private transformRow(
    row: Record<string, string>,
    mappings: Array<DataInjectionMapping>,
    source: DataInjectionSource,
    user_id: number
  ): DataInjection {
    if (!source.id) {
      throw new Error("Missing source id");
    }
    const base = makeDataInjectionBase(source.id, user_id);
    const transformed: any = { ...base };

    if (source.source_name === "Workhub") {
      const raw = row["Incident Date"]?.trim() || "";
      row["Incident Date"] = this.formatDate(raw) || "";
    }
    console.log("Transforming row:", row);
    mappings.forEach(({ source_attribute, target_attribute, source_value, target_value }) => {
      const raw = row[source_attribute];
      if (raw == undefined)
        throw new Error(`Missing required attribute: ${source_attribute}. Invalid CSV format?`);

      if (source.source_name === "RL6" && target_attribute === "location_detail") {
        const existing = transformed.location_detail || "";
        transformed.location_detail = existing ? `${existing}, ${raw}` : raw;
      } else if (source_value != null && raw === source_value) {
        transformed[target_attribute] = target_value;
      } else if (source_value == null) {
        transformed[target_attribute] = raw || null;
      }
    });

    return transformed as DataInjection;
  }

  private formatDate(rawString: string): string | null {
      if (!rawString) return null;

      const clean = rawString.replace(/\s*[-–]\s*[^-–]*$/, "").trim();
      console.log("Parsing WorkHub date:", clean);
      const dt = DateTime.fromFormat(clean, "yyyy-MM-dd h:mm a", { zone: "utc" });
      if (!dt.isValid) {
          throw new Error(`Invalid date in WorkHub CSV: ${rawString}`);
      }
      return dt.toISODate();
    }
}
