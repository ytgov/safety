import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("hazard", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("hazard_type").notNullable();
        table.string("description", 4096).nullable();
        table.string("location", 8).nullable();
        table.string("location_detail", 8).nullable();
        table.string("department", 8).nullable();
        table.string("scope", 8).nullable();
        table.string("sensitivity", 8).nullable();
        table.datetime("created_at").nullable().defaultTo(knex.fn.now());
        table.string("status", 8).nullable();
        table.integer("reopen_count").notNullable();

        table.foreign("hazard_type").references("hazard_type.code");
        table.foreign("location").references("location.code");
        table.foreign("department").references("department.code");
        table.foreign("scope").references("scope.code");
        table.foreign("sensitivity").references("sensitivity.code");
        table.foreign("status").references("hazard_status.code");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("hazard");
};
