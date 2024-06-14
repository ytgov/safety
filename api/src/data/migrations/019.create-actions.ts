import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("actions", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("hazard_id").notNullable();
        table.integer("creator_employee_id").nullable();
        table.integer("creator_role_id").nullable();
        table.integer("actor_employee_id").nullable();
        table.integer("actor_role_id").nullable();
        table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
        table.datetime("modified_at").nullable().defaultTo(knex.fn.now());
        table.datetime("due_date").nullable();
        table.string("description", 4096).notNullable();
        table.string("action_type", 8).notNullable();
        table.string("sensitivity", 8).nullable();
        table.string("status", 8).nullable();

        table.foreign("hazard_id").references("hazards.id");
        table.foreign("creator_role_id").references("roles.id");
        table.foreign("actor_role_id").references("roles.id");
        table.foreign("action_type").references("action_types.code");
        table.foreign("sensitivity").references("sensitivities.code");
        table.foreign("status").references("action_statuses.code");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("actions");
};
