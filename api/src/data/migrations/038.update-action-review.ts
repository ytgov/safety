import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.integer("hazard_review").nullable().defaultTo(0);
  });

  await knex("actions").update({ hazard_review: 0 });

  await knex.schema.alterTable("actions", function (table) {
    table.integer("hazard_review").notNullable().alter();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.dropColumn("hazard_review");
  });
}
