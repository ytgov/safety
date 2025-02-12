import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("hazard_attachments", function (table) {
    table.setNullable("deleted_date");
  });
  await knex.schema.alterTable("action_attachments", function (table) {
    table.setNullable("deleted_date");
  });
}

export async function down(knex: knex.Knex) {
  // this is too risky to undo
}
