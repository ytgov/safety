import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("hazards", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("hazard_type_id").notNullable();
    table.string("location_code", 8).nullable();
    table.string("department_code", 8).nullable();
    table.string("scope_code", 8).nullable();
    table.string("status_code", 8).nullable();
    table.string("sensitivity_code", 8).nullable();
    table.string("description", 4000).nullable();
    table.string("location_detail", 1000).nullable();
    table.datetime("created_at").nullable().defaultTo(knex.fn.now());
    table.datetime("reported_at").nullable();
    table.integer("reopen_count").notNullable().defaultTo(0);
    table.string("urgency_code", 8).notNullable();
    table.string("notes", 4000).nullable();

    table.foreign("hazard_type_id").references("hazard_types.id");
    table.foreign("location_code").references("locations.code");
    table.foreign("department_code").references("departments.code");
    table.foreign("scope_code").references("scopes.code");
    table.foreign("sensitivity_code").references("sensitivities.code");
    table.foreign("status_code").references("hazard_statuses.code");
    table.foreign("urgency_code").references("urgencies.code");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("hazards");
}
