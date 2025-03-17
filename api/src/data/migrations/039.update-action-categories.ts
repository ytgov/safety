import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.string("categories", 400).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.dropColumn("categories");
  });
}
