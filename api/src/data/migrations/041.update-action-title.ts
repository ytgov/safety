import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.string("title", 200).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.dropColumn("title");
  });
}
