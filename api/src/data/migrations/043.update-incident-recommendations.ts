import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.text("hs_recommendations").nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.dropColumn("hs_recommendations");
  });
}
