import knex from "knex";
import { DataInjestionSource } from "../models";

export async function seed(knex: knex.Knex) {
  const data_injestion_sources = await knex<DataInjestionSource>("data_injestion_sources");

  const toInsert = [
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
  ] as Array<DataInjestionSource>;

  for (const item of toInsert) {
    if (data_injestion_sources.find((d) => d.source_name == item.source_name)) continue;

    await knex("data_injestion_sources").insert(item);
  }
}
