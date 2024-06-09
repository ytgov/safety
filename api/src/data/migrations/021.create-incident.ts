import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("incident", function(table) {
        table.increments("incident_id").primary().notNullable();
        table.string("reporting_person", 256).nullable();
        table.string("proxy_emplid", 256).nullable(); // inconsistent syntax, proxy_emplid -> proxy_employee_id
        table.integer("proxi_role_id").nullable();  // spelling error? proxi -> proxy
        table.string("description", 4096).notNullable();
        table.string("sensitivity", 8).notNullable().references("sensitivity.code");
        table.datetime("created_date").notNullable();
        table.string("status", 8).notNullable();
        table.string("department", 8).notNullable().references("department.code");
        table.string("supervisor", 256).nullable();
        table.integer("incident_type").notNullable().references("incident_type.code");
    
        // status foreign keys
        // Why do we have multiple foriegn keys for status? Remove this comment once resolved
        table.foreign("status", "incident_incident_status_code_fk").references("incident_status.code");
        table.foreign("status", "incident_incident_status_code_fk2").references("incident_status.code");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("incident");
};
