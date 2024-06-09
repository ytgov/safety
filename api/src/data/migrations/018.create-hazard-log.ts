import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("hazard_log", function(table) {
        table.increments("hazard_log_id").primary().notNullable();
        table.integer("hazard_id").notNullable().references("hazard.hazard_id");
        table.integer("old_hazard_type").notNullable().references("hazard_type.code");
        table.string("old_description", 4096).nullable();
        table.string("old_location", 8).nullable().references("location.code");
        table.string("old_location_detail", 8).nullable();
        table.string("old_department", 8).nullable().references("department.code");
        table.string("old_scope", 8).nullable().references("scope.code");
        table.string("old_sensitivity", 8).nullable().references("sensitivity.code");
        table.string("old_status", 8).nullable().references("hazard_status.code");
        table.integer("old_reopen_count").notNullable();
        table.integer("new_hazard_type").notNullable().references("hazard_type.code");
        table.string("new_description", 4096).nullable();
        table.string("new_location", 8).nullable().references("location.code");
        table.string("new_location_detail", 8).nullable();
        table.string("new_department", 8).nullable().references("department.code");
        table.string("new_scope", 8).nullable().references("scope.code");
        table.string("new_sensitivity", 8).nullable().references("sensitivity.code");
        table.string("new_status", 8).nullable().references("hazard_status.code");
        table.integer("new_reopen_count").notNullable();
        table.string("changer_emplid", 256).nullable();
        table.integer("changer_role_id").nullable().references("role.role_id");
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("hazard_log");
};
