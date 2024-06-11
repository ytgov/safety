import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("incident_log", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("incident_id").notNullable().references("incident.incident_id");
        table.string("old_description", 4096).notNullable();
        table.string("old_sensitivity", 256).nullable().references("sensitivity.code");
        table.string("old_supervisor", 8).nullable();
        table.datetime("old_created_date").notNullable();
        table.string("old_status", 8).nullable();
        table.integer("old_incident_type").nullable().references("incident_type.code");
        table.string("new_description", 4096).notNullable();
        table.string("new_supervisor", 8).nullable();
        table.string("new_sensitivity", 8).nullable().references("sensitivity.code");
        table.datetime("new_created_date").notNullable();
        table.string("new_status", 8).nullable();
        table.integer("new_incident_type").nullable().references("incident_type.code");
        table.string("changer_employee_id", 256).nullable();
        table.integer("changer_role_id").nullable().references("role.role_id");
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();

        // old_status foreign keys
        table.foreign("old_status", "incident_log_old_incident_status_code_fk").references("incident_status.code");
        // shouldn't this be incident_log_old_incident_status_code_fk2 ?
        table.foreign("old_status", "incident_log_old_status_code_fk2").references("incident_status.code");
        
        // new_status foreign keys
        table.foreign("new_status", "incident_log_new_incident_status_code_fk").references("incident_status.code");
        table.foreign("new_status", "incident_log_new_status_code_fk2").references("incident_status.code");

    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("incident_log");
};
