import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable(
    "data_injection_mappings",
    "data_ingestion_mappings"
  );
  await knex.schema.renameTable(
    "data_injection_sources",
    "data_ingestion_sources"
  );
  await knex.schema.renameTable(
    "data_injections",
    "data_ingestions"
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable(
    "data_ingestion_mappings",
    "data_injection_mappings"
  );
  await knex.schema.renameTable(
    "data_ingestion_sources",
    "data_injection_sources"
  );
  await knex.schema.renameTable(
    "data_ingestions",
    "data_injections"
  );
}
