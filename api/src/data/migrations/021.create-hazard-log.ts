import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("hazard_log", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("hazard_id").notNullable();
        table.integer("old_hazard_type").notNullable();
        table.string("old_description", 4096).nullable();
        table.string("old_location", 8).nullable();
        table.string("old_location_detail", 8).nullable();
        table.string("old_department", 8).nullable();
        table.string("old_scope", 8).nullable();
        table.string("old_sensitivity", 8).nullable();
        table.string("old_status", 8).nullable();
        table.integer("old_reopen_count").notNullable();
        table.integer("new_hazard_type").notNullable();
        table.string("new_description", 4096).nullable();
        table.string("new_location", 8).nullable();
        table.string("new_location_detail", 8).nullable();
        table.string("new_department", 8).nullable();
        table.string("new_scope", 8).nullable();
        table.string("new_sensitivity", 8).nullable();
        table.string("new_status", 8).nullable();
        table.integer("new_reopen_count").notNullable();
        table.string("changer_employee_id", 256).nullable();
        table.integer("changer_role_id").nullable();
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();

        table.foreign("hazard_id").references("hazard.id");
        table.foreign("old_hazard_type_id").references("hazard_type.id");
        table.foreign("old_location").references("location.code");
        table.foreign("old_department").references("department.code");
        table.foreign("old_scope").references("scope.code");
        table.foreign("old_sensitivity").references("sensitivity.code");
        table.foreign("old_status").references("hazard_status.code");
        table.foreign("new_hazard_type_id").references("hazard_type.id");
        table.foreign("new_location").references("location.code");
        table.foreign("new_department").references("department.code");
        table.foreign("new_scope").references("scope.code");
        table.foreign("new_sensitivity").references("sensitivity.code");
        table.foreign("new_status").references("hazard_status.code");
        table.foreign("changer_role_id").references("role.id");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("hazard_log");
};
