import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("location", function(table) {
        table.string("code", 8).primary().notNullable();
        table.string("name", 256).notNullable();
        table.string("description", 4096).nullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("location");
};
