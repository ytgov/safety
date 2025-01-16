import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("departments", function (table) {
    table.string("code", 8).primary().notNullable();
    table.string("name", 256).notNullable();
    table.string("description", 4000).nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("departments");
}
