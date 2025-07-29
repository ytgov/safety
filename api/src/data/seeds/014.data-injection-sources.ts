import knex from "knex";
import { DataInjectionSource } from "../models";

export async function seed(knex: knex.Knex) {
  const data_injection_sources = await knex<DataInjectionSource>("data_injection_sources");

  const toInsert = [
    { source_name: "RL6", description: "HSS's incident system", identifier_column_name: "File ID", column_count: 10 },
    { source_name: "Vortex", description: "Airport's incident system", identifier_column_name: "ID", column_count: 8 },
    { source_name: "Workhub", description: "HPW's Incident system", identifier_column_name: "Number", column_count: 32 },
  ] as Array<DataInjectionSource>;

  for (const item of toInsert) {
    if (data_injection_sources.find((d) => d.source_name == item.source_name)) continue;

    await knex("data_injection_sources").insert(item);
  }
}
