import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("data_injection_sources", function (table) {
    table.increments("id").notNullable().primary();
    table.string("source_name", 250).notNullable();
    table.string("description").notNullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("data_injection_sources");
}
