import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("action_logs", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("action_id"); // nullable or not nullable isnt specified
        table.integer("hazard_id").notNullable();
        table.integer("old_actor_employee_id").nullable();
        table.integer("old_actor_role_id").nullable();
        table.datetime("old_due_date").notNullable();
        table.string("old_description", 4096).notNullable();
        table.string("old_action_type", 8).notNullable();
        table.string("old_sensitivity", 8).nullable();
        table.string("old_status", 8).nullable();
        table.integer("new_actor_employee_id").nullable();
        table.integer("new_actor_role_id").nullable();
        table.datetime("new_due_date").notNullable();
        table.string("new_description", 4096).notNullable();
        table.string("new_action_type", 8).notNullable();
        table.string("new_sensitivity", 8).nullable();
        table.string("new_status", 8).nullable();
        table.string("changer_employee_id", 256).nullable();
        table.integer("changer_role_id").nullable();
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();
    
        table.foreign("old_actor_role_id").references("roles.id");
        table.foreign("old_action_type").references("action_types.code");
        table.foreign("old_sensitivity").references("sensitivities.code");
        table.foreign("old_status").references("action_statuses.code");
        table.foreign("new_actor_role_id").references("roles.id");
        table.foreign("new_action_type").references("action_types.code");
        table.foreign("new_sensitivity").references("sensitivities.code");
        table.foreign("new_status").references("action_statuses.code");
        table.foreign("changer_role_id").references("roles.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("action_logs");
};
