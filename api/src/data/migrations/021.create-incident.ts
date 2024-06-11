import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("incident", function(table) {
        table.increments("id").primary().notNullable();
        table.string("reporting_person", 256).nullable();
        table.string("proxy_employee_id", 256).nullable();
        table.integer("proxy_role_id").nullable();
        table.string("description", 4096).notNullable();
        table.string("sensitivity", 8).notNullable();
        table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
        table.string("status", 8).notNullable();
        table.string("department", 8).notNullable();
        table.string("supervisor", 256).nullable();
        table.integer("incident_type").notNullable();

        table.foreign("sensitivity").references("sensitivity.code");
        // status foreign keys
        // Why do we have multiple foriegn keys for status? Remove this comment once resolved
        table.foreign("status", "incident_incident_status_code_fk").references("incident_status.code");
        table.foreign("status", "incident_incident_status_code_fk2").references("incident_status.code");
        table.foreign("department").references("department.code");
        table.foreign("incident_type").references("incident_type.code");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("incident");
};
