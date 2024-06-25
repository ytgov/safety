import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("action_logs", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("action_id").nullable()
        table.integer("hazard_id").nullable();
        table.integer("old_actor_user_id").nullable();
        table.integer("old_actor_role_id").nullable();
        table.datetime("old_due_date").notNullable();
        table.string("old_description", 4000).notNullable();
        table.string("old_action_type_code", 8).notNullable();
        table.string("old_sensitivity_code", 8).nullable();
        table.string("old_status_code", 8).nullable();
        table.integer("new_actor_user_id").nullable();
        table.integer("new_actor_role_id").nullable();
        table.datetime("new_due_date").notNullable();
        table.string("new_description", 4000).notNullable();
        table.string("new_action_type_code", 8).notNullable();
        table.string("new_sensitivity_code", 8).nullable();
        table.string("new_status_code", 8).nullable();
        table.integer("changer_user_id").nullable();
        table.integer("changer_role_id").nullable();
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4000).notNullable();
        table.string("user_action", 8).notNullable();
    
        table.foreign("action_id").references("actions.id");
        table.foreign("hazard_id").references("hazards.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("action_logs");
};
