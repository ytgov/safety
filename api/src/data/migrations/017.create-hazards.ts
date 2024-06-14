import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("hazards", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("hazard_type_id").notNullable();
        table.string("description", 4096).nullable();
        table.string("location", 8).nullable();
        table.string("location_detail", 8).nullable();
        table.string("department", 8).nullable();
        table.string("scope", 8).nullable();
        table.string("sensitivity", 8).nullable();
        table.datetime("created_at").nullable().defaultTo(knex.fn.now());
        table.string("status", 8).nullable();
        table.integer("reopen_count").notNullable();

        table.foreign("hazard_type_id").references("hazard_type.id");
        table.foreign("location").references("location.code");
        table.foreign("department").references("department.code");
        table.foreign("scope").references("scope.code");
        table.foreign("sensitivity").references("sensitivity.code");
        table.foreign("status").references("hazard_status.code");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("hazards");
};
