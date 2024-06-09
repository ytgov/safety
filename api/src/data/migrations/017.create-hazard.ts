import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("hazard", function(table) {
        table.increments("hazard_id").primary().notNullable();
        table.integer("hazard_type").notNullable().references("hazard_type.code");
        table.string("description", 4096).nullable();
        table.string("location", 8).nullable().references("location.code");
        table.string("location_detail", 8).nullable();
        table.string("department", 8).nullable().references("department.code");
        table.string("scope", 8).nullable().references("scope.code");
        table.string("sensitivity", 8).nullable().references("sensitivity.code");
        table.datetime("created_date").nullable();
        table.string("status", 8).nullable().references("hazard_status.code");
        table.integer("reopen_count").notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("hazard");
};
