import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("role", function(table) {
        table.increments("id").primary().notNullable();
        table.string("name", 256).nullable();
        table.string("department", 8).nullable();
        table.string("location", 8).nullable();
        table.integer("role_type_id").notNullable();
        table.string("employee_id", 256).notNullable();
        table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
        table.integer("creator").notNullable();
        table.datetime("start_date").notNullable();
        table.datetime("end_date").notNullable();

        table.foreign("department").references("department.code");
        table.foreign("location").references("location.code");
        table.foreign("role_type_id").references("role_type.id");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("role");
};
