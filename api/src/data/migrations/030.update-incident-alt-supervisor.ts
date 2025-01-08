import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.string("supervisor_alt_email", 250).nullable();
    table.string("additional_description", 4000).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.dropColumn("supervisor_alt_email");
    table.dropColumn("additional_description");
  });
}
