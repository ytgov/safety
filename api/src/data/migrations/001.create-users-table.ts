import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("users", function (table) {
    table.increments("id").notNullable().primary();
    table.string("email", 250).notNullable();
    table.string("auth_subject", 250).notNullable();
    table.string("first_name", 100);
    table.string("last_name", 100);
    table.string("display_name", 200);
    table.string("title", 100);
    table.string("department", 100);
    table.string("division", 100);
    table.string("branch", 100);
    table.string("unit", 100);
    table.boolean("is_active").defaultTo(true).notNullable();

    table.unique(["email"], {
      indexName: "unique_users_email",
    });
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("users");
}
