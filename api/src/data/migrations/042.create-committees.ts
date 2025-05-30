import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("committees", function (table) {
    table.increments("id").primary().notNullable();
    table.string("name", 256).notNullable();
    table.string("department_code", 8).nullable();

    table.foreign("department_code").references("departments.code");
  });

  await knex.schema.createTable("committee_users", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("committee_id").notNullable();
    table.integer("user_id").nullable();

    table.foreign("committee_id").references("committees.id");
    table.foreign("user_id").references("users.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("committee_users");
  await knex.schema.dropTable("committees");
}
