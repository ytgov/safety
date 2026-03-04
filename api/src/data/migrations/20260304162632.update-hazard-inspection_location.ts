import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("hazards", function (table) {
    table.integer("inspection_location_id").nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("hazards", function (table) {
    table.dropColumn("inspection_location_id");
  });
}
