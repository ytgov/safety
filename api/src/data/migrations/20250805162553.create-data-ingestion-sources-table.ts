import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("data_ingestion_sources", function (table) {
    table.increments("id").notNullable().primary();
    table.string("source_name", 250).notNullable();
    table.string("description").notNullable();
    table.string("identifier_column_name", 250).notNullable();
    table.integer("column_count").notNullable();
    table.string("source_attribute_to_transform").nullable();
    table.string("target_attribute_to_transform").nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("data_ingestion_sources");
}
