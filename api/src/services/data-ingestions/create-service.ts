import Papa from "papaparse";
import { DateTime } from "luxon";
import { isNil } from "lodash";

import { db } from "@/data/db-client";
import {
  DataIngestion,
  DataIngestionMapping,
  DataIngestionSource,
  DataIngestionSourceNames,
} from "@/data/models";
import BaseService from "@/services/base-service";
import { InsertableDate } from "@/utils/formatters";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class CreateService extends BaseService {
  constructor(
    private csvBuffer: Buffer,
    private source_id: number,
    private user_id: number
  ) {
    super();
  }

  async perform(): Promise<void> {
    const csvText = this.csvBuffer.toString("utf-8");

    const source = await this.getSourceOrThrow(this.source_id);
    const rows = this.parseAndValidateCsv(source, csvText);

    await this.clearDataIngestions(source, rows);
    const mappings = await db("data_ingestion_mappings").where({ source_id: this.source_id });
    const transformed = rows.map((row) => this.transformRow(row, mappings, source, this.user_id));
    await db.transaction((trx) => trx.batchInsert("data_ingestions", transformed, 500));
  }

  async clearDataIngestions(
    source: DataIngestionSource,
    rows: Record<string, string>[]
  ): Promise<void> {
    const identifiers = rows
      .map((row) => row[source.identifier_column_name])
      .filter((id): id is string => Boolean(id));

    if (identifiers.length === 0) {
      return;
    }

    await db("data_ingestions")
      .where({ source_id: source.id })
      .whereIn("identifier", identifiers)
      .delete();
  }

  private async getSourceOrThrow(source_id: number): Promise<DataIngestionSource> {
    const source = await db("data_ingestion_sources").where({ id: source_id }).first();
    if (isNil(source)) throw new Error(`Unknown source ID: ${source_id}`);
    return source;
  }

  private parseAndValidateCsv(
    source: DataIngestionSource,
    csvText: string
  ): Record<string, string>[] {
    const lines = csvText.split(/\r?\n/);
    const headerIndex = lines.findIndex((l) => l.includes(source.identifier_column_name));
    if (headerIndex < 0) {
      throw new Error(`Invalid data format for Data Source "${source.source_name}": header row with '${source.identifier_column_name}' not found`);
    }

    const trimmed = lines.slice(headerIndex).join("\n");
    const { data, meta } = Papa.parse<Record<string, string>>(trimmed, {
      header: true,
      skipEmptyLines: true,
    });

    if (meta.fields?.length !== source.column_count) {
      throw new Error(`Invalid data format for Data Source "${source.source_name}": wrong number of columns`);
    }
    const validData = data.filter((r) => r[source.identifier_column_name]?.trim().length);
    if (validData.length === 0) {
      throw new Error("No valid data found in the CSV file.");
    }

    return validData;
  }

  private isIsoDateString(str: string): boolean {
    return ISO_DATE_REGEX.test(str) && !isNaN(Date.parse(str));
  }

  private transformRow(
    row: Record<string, string>,
    mappings: Array<DataIngestionMapping>,
    source: DataIngestionSource,
    user_id: number
  ): DataIngestion {
    if (isNil(source.id)) {
      throw new Error("Missing source id");
    }
    const dataInjestiontionAttributes: Partial<DataIngestion> = {
      source_id: source.id,
      incident_type_id: 5,
      status_code: "NoAct",
      proxy_user_id: user_id,
    };
    const transformed: any = { ...dataInjestiontionAttributes };

    if (
      source.source_name === DataIngestionSourceNames.WORKHUB &&
      source.source_attribute_to_transform
    ) {
      const raw = row[source.source_attribute_to_transform]?.trim() || "";
      row[source.source_attribute_to_transform] = this.formatDate(source, raw) || "";
    }

    mappings.forEach(({ source_attribute, target_attribute, source_value, target_value }) => {
      const raw = row[source_attribute];
      if (raw == undefined)
        throw new Error(`Missing required attribute: ${source_attribute}. Invalid CSV format?`);

      if (
        source.source_name === DataIngestionSourceNames.RL6 &&
        target_attribute === source.target_attribute_to_transform
      ) {
        const existing = transformed.location_detail || "";
        transformed.location_detail = existing ? `${existing}, ${raw}` : raw;
      } else if (!isNil(source_value) && raw === source_value) {
        transformed[target_attribute] = target_value;
      } else if (source_value == null && this.isIsoDateString(raw)) {
        transformed[target_attribute] = InsertableDate(raw) || null;
      }
      else if (source_value == null) {
        transformed[target_attribute] = raw || null;
      }
    });

    return transformed as DataIngestion;
  }

  private formatDate(source: DataIngestionSource, rawString: string): string | null {
    const cleanString = rawString.trim();
    if (!cleanString) return null;

    const clean = cleanString.replace(/\s*[-–]\s*[^-–]*$/, "").trim();

    const date = DateTime.fromFormat(clean, "yyyy-MM-dd h:mm a", { zone: "utc" });
    if (!date.isValid) {
      throw new Error(`Invalid date in WorkHub CSV: ${rawString}`);
    }
    return date.toISODate();
  }

}
