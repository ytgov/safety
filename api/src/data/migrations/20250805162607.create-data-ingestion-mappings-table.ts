import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("data_ingestion_mappings", function (table) {
    table.increments("id").notNullable().primary();
    table.integer("source_id").notNullable();
    table.string("source_attribute", 250).notNullable();
    table.string("source_value").nullable();
    table.string("target_attribute", 250).notNullable();
    table.string("target_value").nullable();

    table.foreign("source_id").references("data_ingestion_sources.id");

    table.unique(
      ["source_id","source_attribute","source_value","target_attribute"],
      { indexName: "unique_data_ingestion_mappings" }
    );
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("data_ingestion_mappings");
}
