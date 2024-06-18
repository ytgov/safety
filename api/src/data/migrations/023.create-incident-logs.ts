import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("incident_logs", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("incident_id").notNullable();
        table.string("old_description", 4096).notNullable();
        table.string("old_sensitivity_code", 256).nullable();
        table.string("old_supervisor", 8).nullable();
        table.datetime("old_created_date").notNullable();
        table.string("old_status_code", 8).nullable();
        table.integer("old_incident_type_id").nullable();
        table.string("new_description", 4096).notNullable();
        table.string("new_supervisor", 8).nullable();
        table.string("new_sensitivity_code", 8).nullable();
        table.datetime("new_created_date").notNullable();
        table.string("new_status_code", 8).nullable();
        table.integer("new_incident_type_id").nullable();
        table.string("changer_employee_id", 256).nullable();
        table.integer("changer_role_id").nullable();
        table.datetime("changed_date").notNullable();
        table.string("log_comment", 4096).notNullable();
        table.string("user_action", 8).notNullable();

        table.foreign("incident_id").references("incidents.id");
        table.foreign("old_sensitivity_code").references("sensitivities.code");
        table.foreign("old_status_code").references("incident_statuses.code");
        table.foreign("old_incident_type_id").references("incident_types.id");
        table.foreign("new_sensitivity_code").references("sensitivities.code");
        table.foreign("new_status_code").references("incident_statuses.code");
        table.foreign("new_incident_type_id").references("incident_types.id");
        table.foreign("changer_role_id").references("roles.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("incident_logs");
};
