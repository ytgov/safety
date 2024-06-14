import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("reports", function(table) {
        table.increments("id").notNullable().primary();
        table.string("email", 100).notNullable();
        table.specificType("createDate", "TIMESTAMP(6)").notNullable();
        table.specificType("date", "TIMESTAMP(6)").nullable();
        table.string("description", 1000);
        table.string("eventType", 1000);
        table.string("generalLocation", 2000);
        table.string("specificLocation", 1000);
        table.boolean("supervisorNotified");
        table.string("status", 100);
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("reports");
};
