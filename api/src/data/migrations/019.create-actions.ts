import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("actions", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("hazard_id").nullable();
        table.integer("incident_id").nullable();
        table.integer("creator_user_id").nullable();
        table.integer("creator_role_type_id").nullable();
        table.integer("actor_user_id").nullable();
        table.integer("actor_user_email").nullable();
        table.integer("actor_role_type_id").nullable();
        table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
        table.datetime("modified_at").nullable().defaultTo(knex.fn.now());
        table.datetime("due_date").nullable();
        table.string("description", 4000).notNullable();
        table.string("action_type_code", 8).notNullable();
        table.string("sensitivity_code", 8).nullable();
        table.string("status_code", 8).nullable();

        table.foreign("hazard_id").references("hazards.id");
        table.foreign("incident_id").references("incidents.id");
        table.foreign("creator_user_id").references("users.id");
        table.foreign("actor_user_id").references("users.id");
        table.foreign("creator_role_type_id").references("role_types.id");
        table.foreign("actor_role_type_id").references("role_types.id");
        table.foreign("action_type_code").references("action_types.code");
        table.foreign("sensitivity_code").references("sensitivities.code");
        table.foreign("status_code").references("action_statuses.code");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("actions");
};
