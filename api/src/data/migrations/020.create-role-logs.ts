import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("role_logs", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("role_id").notNullable();
        table.string("old_name", 256).nullable();
        table.string("old_department", 8).nullable();
        table.string("old_location", 8).nullable();
        table.integer("old_role_type_id").notNullable();
        table.string("old_employee_id", 256).notNullable();
        table.datetime("old_start_date").notNullable();
        table.datetime("old_end_date").notNullable();
        table.string("new_name", 256).nullable();
        table.string("new_department", 8).nullable();
        table.string("new_location", 8).nullable();
        table.integer("new_role_type_id").notNullable();
        table.string("new_employee_id", 256).notNullable();
        table.datetime("new_start_date").notNullable();
        table.datetime("new_end_date").notNullable();
        table.string("changer_employee_id", 256).nullable();
        table.integer("changer_role_id").nullable();
        table.datetime("changed_date").notNullable(); // defaultTo now?
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();

        table.foreign("role_id").references("role.id");
        table.foreign("old_department").references("department.code");
        table.foreign("old_location").references("location.code");
        table.foreign("old_role_type_id").references("role_type.id");
        table.foreign("new_department").references("department.code");
        table.foreign("new_location").references("location.code");
        table.foreign("new_role_type_id").references("role_type.id");
        table.foreign("changer_role_id").references("role.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("role_logs");
};
