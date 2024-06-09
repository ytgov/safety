import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("role", function(table) {
        table.increments("role_id").primary().notNullable();
        table.string("name", 256).nullable();
        table.string("department", 8).nullable().references("department.code");
        table.string("location", 8).nullable().references("location.code");
        table.integer("role_type_id").notNullable().references("role_type.role_type_id");
        table.string("emplid", 256).notNullable();
        table.datetime("created_date").notNullable();
        table.integer("creator").notNullable();
        table.datetime("start_date").notNullable();
        table.datetime("end_date").notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("role");
};
