import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("role_types", function(table) {
        table.increments("id").primary().notNullable();
        table.string("name", 256).notNullable();
        table.integer("permissions").notNullable();
        table.string("description", 4000).notNullable();
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("role_types");
};
