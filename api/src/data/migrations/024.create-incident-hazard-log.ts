import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("incident_hazard_log", function(table) {
        table.increments("incident_hazard_log_id").primary().notNullable();
        table.integer("incident_hazard_id").notNullable().references("incident_hazard.incident_hazard_id");
        table.string("old_incident_hazard_type", 8).notNullable().references("incident_hazard_type.code");
        table.string("new_incident_hazard_type", 8).notNullable().references("incident_hazard_type.code");
        table.string("changer_emplid", 256).nullable();
        table.integer("changer_role_id").nullable().references("role.role_id");
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("incident_hazard_log");
};
