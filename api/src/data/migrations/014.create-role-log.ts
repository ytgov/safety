import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("role_log", function(table) {
        table.increments("code").primary().notNullable();
        table.integer("role_id").notNullable().references("role.role_id");
        table.string("old_name", 256).nullable();
        table.string("old_department", 8).nullable().references("department.code");
        table.string("old_location", 8).nullable().references("location.code");
        table.integer("old_role_type_id").notNullable().references("role_type.role_type_id");
        table.string("old_employee_id", 256).notNullable();
        table.datetime("old_start_date").notNullable();
        table.datetime("old_end_date").notNullable();
        table.string("new_name", 256).nullable();
        table.string("new_department", 8).nullable().references("department.code");
        table.string("new_location", 8).nullable().references("location.code");
        table.integer("new_role_type_id").notNullable().references("role_type.role_type_id");
        table.string("new_employee_id", 256).notNullable();
        table.datetime("new_start_date").notNullable();
        table.datetime("new_end_date").notNullable();
        table.string("changer_employee_id", 256).nullable();
        table.integer("changer_role_id").nullable().references("role.role_id");
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("role_log");
};
