import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("incident_type", function(table) {
        table.increments("code").primary().notNullable();
        table.string("name", 256).notNullable();
        table.string("description", 4096).nullable();
        table.boolean("searchable").notNullable();
        table.integer("added_by").notNullable();
        table.integer("made_searchable_by").nullable();
        table.datetime("created_date").nullable();
        table.date("searchable_date");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("incident_type");
};
