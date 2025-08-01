import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("data_injection_mappings", function (table) {
    table.increments("id").notNullable().primary();
    table.integer("source_id").notNullable();
    table.string("source_attribute", 250).notNullable();
    table.string("source_value").nullable();
    table.string("target_attribute", 250).notNullable();
    table.string("target_value").nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("data_injection_mappings");
}
