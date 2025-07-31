import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable(
    "data_injection_mappings",
    "data_injestion_mappings"
  );
  await knex.schema.renameTable(
    "data_injection_sources",
    "data_injestion_sources"
  );
  await knex.schema.renameTable(
    "data_injections",
    "data_injestions"
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable(
    "data_injestion_mappings",
    "data_injection_mappings"
  );
  await knex.schema.renameTable(
    "data_injestion_sources",
    "data_injection_sources"
  );
  await knex.schema.renameTable(
    "data_injestions",
    "data_injections"
  );
}
