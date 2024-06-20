import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("incident_types", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("create_user_id").notNullable();
        table.integer("searchable_user_id").nullable();
        table.string("name", 256).notNullable();
        table.string("description", 4096).nullable();
        table.boolean("is_searchable").notNullable().defaultTo(true);
        table.datetime("created_at").nullable().defaultTo(knex.fn.now());
        table.date("searchable_on").nullable();
        
        table.foreign("create_user_id").references("users.id");
        table.foreign("searchable_user_id").references("users.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("incident_types");
};
