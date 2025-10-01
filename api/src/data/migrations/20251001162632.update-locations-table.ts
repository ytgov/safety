import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("locations", function (table) {
    table.string("community", 256).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("locations", function (table) {
    table.dropColumn("community");
  });
}
