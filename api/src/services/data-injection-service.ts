import { promises as fs, readFileSync } from "fs";
import Papa from "papaparse";
import { db } from "../data";
import { DataInjectionSource, DataInjection } from "src/data/models";

function makeDataInjectionBase(
  source_id: number,
  user_id: number
): Omit<DataInjection, 'id'> {
  return {
    source_id:        source_id,
    identifier:       "",
    incident_type_id: 5,
    status_code:      "NoAct",
    proxy_user_id:    user_id,
    description:           "",
    description_moderated: "",
    urgency_code:         "",
    location_detail:      "",
    created_at:       new Date(),
  };
}

export class DataInjectionService {

  async insertCsvFromFilePath(
    csvBuffer: Buffer,
    source_id: number,
    user_id: number
  ): Promise<void> {
    // Convert buffer → UTF-8 text
    const csvText = csvBuffer.toString("utf-8");

    // Fetch config & parse
    const source = await this.getSourceOrThrow(source_id);
    const rows   = this.parseAndValidateCsv(source, csvText);
    if (rows.length === 0) {
      throw new Error("No valid data found in the CSV file.");
    }

    // Clear + transform + insert
    await this.clearDataInjections(source, rows);
    const mappings    = await db("data_injection_mappings").where({ source_id });
    const transformed = rows.map(row =>
      this.transformRow(row, mappings, source.source_name, source_id, user_id)
    );
    await db.transaction(trx => trx.batchInsert("data_injections", transformed, 500));
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
      source_id: number
    ): Promise<DataInjectionSource> {
      const source = await db("data_injection_sources").where({ id: source_id }).first();
      if (!source) throw new Error(`Unknown source ID: ${source_id}`);
      return source;
    }

  private parseAndValidateCsv(
    source: DataInjectionSource,
    csvText: string
  ): Record<string, string>[] {
    const lines = csvText.split(/\r?\n/);
    const idx   = lines.findIndex(l => l.includes(source.identifier_column_name));
    if (idx < 0) {
      throw new Error(`Header row with '${source.identifier_column_name}' not found`);
    }
    const trimmed = lines.slice(idx).join("\n");
    const { data, meta } = Papa.parse<Record<string, string>>(trimmed, {
      header: true,
      skipEmptyLines: true,
    });
    if (meta.fields?.length !== source.column_count) {
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
      source_id: number,
      user_id: number
    ): DataInjection {
      const base = makeDataInjectionBase(source_id, user_id);
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


