import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.string("source", 50).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.dropColumn("source");
  });
}
