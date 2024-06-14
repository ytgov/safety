import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("hazard_types", function(table) {
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

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("hazard_types");
};
