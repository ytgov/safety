import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.string("location_code", 8).nullable();
    table.string("location_detail", 1000).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.dropColumn("location_code");
    table.dropColumn("location_detail");
  });
}
