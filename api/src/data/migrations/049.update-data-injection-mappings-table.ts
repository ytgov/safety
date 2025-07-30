import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("data_injection_mappings", function (table) {
    table.foreign("source_id").references("data_injection_sources.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("data_injection_mappings", function (table) {
    table.dropForeign(["source_id"]);
  });
}
