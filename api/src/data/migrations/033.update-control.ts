import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("hazards", function (table) {
    table.string("control", 50).nullable();
  });
  await knex.schema.alterTable("actions", function (table) {
    table.string("control", 50).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("hazards", function (table) {
    table.dropColumn("control");
  });
  await knex.schema.alterTable("actions", function (table) {
    table.dropColumn("control");
  });
}
