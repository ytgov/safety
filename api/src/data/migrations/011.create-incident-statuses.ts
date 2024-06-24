import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("incident_statuses", function(table) {
        table.string("code", 8).primary().notNullable();
        table.string("name", 256).notNullable();
        table.string("description", 4096).nullable();
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("incident_statuses");
};
