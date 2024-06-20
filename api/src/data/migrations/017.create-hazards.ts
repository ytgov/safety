import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("hazards", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("hazard_type_id").notNullable();
        table.string("description", 4096).nullable();
        table.string("location_code", 8).nullable();
        table.string("location_detail", 8).nullable();
        table.string("department_code", 8).nullable();
        table.string("scope_code", 8).nullable();
        table.string("sensitivity_code", 8).nullable();
        table.datetime("created_at").nullable().defaultTo(knex.fn.now());
        table.string("status_code", 8).nullable();
        table.integer("reopen_count").notNullable();

        table.foreign("hazard_type_id").references("hazard_types.id");
        table.foreign("location_code").references("locations.code");
        table.foreign("department_code").references("departments.code");
        table.foreign("scope_code").references("scopes.code");
        table.foreign("sensitivity_code").references("sensitivities.code");
        table.foreign("status_code").references("hazard_statuses.code");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("hazards");
};
