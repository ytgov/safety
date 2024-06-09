import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("action", function(table) {
        table.increments("action_id").primary().notNullable();
        table.integer("hazard_id").notNullable().references("hazard.hazard_id");
        table.integer("creator_emplId").nullable();
        table.integer("creator_role_id").nullable().references("role.role_id");
        table.integer("actor_emplId").nullable();
        table.integer("actor_role_id").nullable().references("role.role_id");
        table.datetime("created_date").notNullable();
        table.datetime("modified_date").nullable();
        table.datetime("due_date").nullable();
        table.string("description", 4096).notNullable();
        table.string("action_type", 8).notNullable().references("action_type.code");
        table.string("sensitivity", 8).nullable().references("sensitivity.code");
        table.string("status", 8).nullable().references("action_status.code");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("action");
};
