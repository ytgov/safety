import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("action_log", function(table) {
        table.increments("action_log_id").primary().notNullable();
        table.integer("action_id"); // nullable or not nullable isnt specified
        table.integer("hazard_id").notNullable();
        table.integer("old_actor_employee_id").nullable();
        table.integer("old_actor_role_id").nullable().references("role.role_id");
        table.datetime("old_due_date").notNullable();
        table.string("old_description", 4096).notNullable();
        table.string("old_action_type", 8).notNullable().references("action_type.code");
        table.string("old_sensitivity", 8).nullable().references("sensitivity.code");
        table.string("old_status", 8).nullable().references("action_status.code");
        table.integer("new_actor_employee_id").nullable();
        table.integer("new_actor_role_id").nullable().references("role.role_id");
        table.datetime("new_due_date").notNullable();
        table.string("new_description", 4096).notNullable();
        table.string("new_action_type", 8).notNullable().references("action_type.code");
        table.string("new_sensitivity", 8).nullable().references("sensitivity.code");
        table.string("new_status", 8).nullable().references("action_status.code");
        table.string("changer_employee_id", 256).nullable();
        table.integer("changer_role_id").nullable().references("role.role_id");
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("action_log");
};
