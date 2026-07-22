import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("users", function (table) {
    table.string("upn", 250).nullable();

    table.index(["upn"], "index_users_upn");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("users", function (table) {
    table.dropIndex(["upn"], "index_users_upn");
    table.dropColumn("upn");
  });
}
