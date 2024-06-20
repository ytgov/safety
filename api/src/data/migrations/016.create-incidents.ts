import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("incidents", function(table) {
        table.increments("id").primary().notNullable();
        table.string("reporting_person", 256).nullable();
        table.string("proxy_employee_id", 256).nullable();
        table.integer("proxy_role_id").nullable();
        table.string("description", 4096).notNullable();
        table.string("sensitivity_code", 8).notNullable();
        table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
        table.string("status_code", 8).notNullable();
        table.string("department_code", 8).notNullable();
        table.string("supervisor", 256).nullable();
        table.integer("incident_type_id").notNullable();

        table.foreign("sensitivity_code").references("sensitivities.code");
        table.foreign("status_code").references("incident_statuses.code");
        table.foreign("department_code").references("departments.code");
        table.foreign("incident_type_id").references("incident_types.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("incidents");
};
