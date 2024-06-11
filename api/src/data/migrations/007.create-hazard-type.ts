import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("hazard_type", function(table) {
        table.increments("id").primary().notNullable();
        table.string("name", 256).notNullable();
        table.string("description", 4096).nullable();
        table.boolean("searchable").notNullable();
        table.integer("added_by").notNullable(); // look into renaming this
        table.integer("made_searchable_by").nullable(); // look into renaming this
        table.datetime("created_at").nullable().defaultTo(knex.fn.now());
        table.date("searchable_on").nullable();

        table.foreign("added_by").references("role.id");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("hazard_type");
};
