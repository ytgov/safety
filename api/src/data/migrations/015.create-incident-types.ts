import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("incident_types", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("create_user_id").nullable();
    table.integer("searchable_user_id").nullable();
    table.string("name", 256).notNullable();
    table.string("description", 4000).nullable();
    table.boolean("is_searchable").notNullable().defaultTo(true);
    table.specificType("created_at", "TIMESTAMP(0) WITH TIME ZONE").nullable().defaultTo(knex.fn.now());
    table.date("searchable_on").nullable();

    table.foreign("create_user_id").references("users.id");
    table.foreign("searchable_user_id").references("users.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("incident_types");
}
