import knex from "knex";
import { DataIngestionSource } from "@/data/models";

export async function seed(knex: knex.Knex) {
  const data_ingestion_sources = await knex<DataIngestionSource>("data_ingestion_sources");

  const dataIngestionSourcesAttributes: DataIngestionSource[]  = [
    {
      source_name: "RL6",
      description: "HSS's incident system",
      identifier_column_name: "File ID",
      column_count: 10,
      target_attribute_to_transform: "location_detail",
    },
    {
      source_name: "Vortex",
      description: "Airport's incident system",
      identifier_column_name: "ID",
      column_count: 9,
    },
    {
      source_name: "Workhub",
      description: "HPW's Incident system",
      identifier_column_name: "Number",
      column_count: 32,
      source_attribute_to_transform: "Incident Date",
    },
  ] as Array<DataIngestionSource>;

  for (const dataIngestionSourcesAttribute of dataIngestionSourcesAttributes) {
    const existing = await knex("data_ingestion_sources")
      .where({ source_name: dataIngestionSourcesAttribute.source_name })
      .first();

    if (existing) {
      await knex("data_ingestion_sources").where({ source_name: dataIngestionSourcesAttribute.source_name }).update(dataIngestionSourcesAttribute);
    } else {
      await knex("data_ingestion_sources").insert(dataIngestionSourcesAttribute);
    }
  }
}
