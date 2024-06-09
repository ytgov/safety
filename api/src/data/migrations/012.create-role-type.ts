import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("role_type", function(table) {
        table.integer("role_type_id").primary().notNullable();
        table.string("name", 256).notNullable();
        table.integer("permissions").notNullable();
        table.string("description", 4096).notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("role_type");
};
