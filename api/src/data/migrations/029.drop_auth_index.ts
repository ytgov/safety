import * as knex from "knex";

export async function up(knex: knex.Knex) {
  return knex.schema.alterTable("users", (table) => {
    table.dropChecks("unique_users_auth_subject")
  });
}

export async function down(knex: knex.Knex) {
  return knex.schema.alterTable("users", (table) => {
    table.unique(["auth_subject"], {
      indexName: "unique_users_auth_subject",
    });
  });
}
