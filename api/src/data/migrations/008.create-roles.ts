import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("roles", function(table) {
        table.increments("id").primary().notNullable();
        table.string("name", 256).nullable();
        table.string("department", 8).nullable();
        table.string("location", 8).nullable();
        table.integer("role_type_id").notNullable();
        table.string("employee_id", 256).notNullable();
        table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
        table.integer("creator").notNullable();
        table.datetime("start_date").notNullable();
        table.datetime("end_date").notNullable();

        table.foreign("department").references("departments.code");
        table.foreign("location").references("locations.code");
        table.foreign("role_type_id").references("role_types.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("roles");
};
