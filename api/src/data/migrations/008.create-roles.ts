import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("user_roles", function(table) {
        table.increments("id").primary().notNullable();
        table.string("name", 256).nullable();
        table.string("department_code", 8).nullable();
        table.string("location_code", 8).nullable();
        table.integer("role_type_id").notNullable();
        table.integer("user_id").notNullable();
        table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
        table.integer("create_user_id").notNullable();
        table.datetime("start_date").notNullable();
        table.datetime("end_date").nullable();

        table.foreign("department_code").references("departments.code");
        table.foreign("location_code").references("locations.code");
        table.foreign("role_type_id").references("role_types.id");
        table.foreign("create_user_id").references("users.id");
        table.foreign("user_id").references("users.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("user_roles");
};
