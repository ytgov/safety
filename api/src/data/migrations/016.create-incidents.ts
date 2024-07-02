import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("incidents", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("proxy_role_type_id").nullable();
    table.integer("incident_type_id").notNullable();
    table.string("sensitivity_code", 8).notNullable();
    table.string("status_code", 8).notNullable();
    table.string("department_code", 8).notNullable();
    table.string("reporting_person_email", 250).nullable();
    table.string("supervisor_email", 250).nullable();
    table.integer("proxy_user_id").nullable();
    table.string("description", 4000).notNullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.datetime("reported_at").nullable();
    table.string("urgency_code").notNullable();

    table.foreign("sensitivity_code").references("sensitivities.code");
    table.foreign("status_code").references("incident_statuses.code");
    table.foreign("department_code").references("departments.code");
    table.foreign("incident_type_id").references("incident_types.id");
    table.foreign("proxy_user_id").references("users.id");
    table.foreign("proxy_role_type_id").references("role_types.id");
    table.foreign("urgency_code").references("urgencies.code");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("incidents");
}
