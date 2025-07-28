import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("data_injections", function (table) {
    table.increments("id").notNullable().primary();
    table.integer("source_id").notNullable();
    table.string("identifier", 100).notNullable();
    table.integer("incident_type_id").notNullable();
    table.string("status_code", 50).notNullable();
    table.integer("proxy_user_id").notNullable();
    table.string("description").nullable();
    table.string("description_moderated").nullable();
    table.string("urgency_code", 8).nullable();
    table.string("location_detail").nullable();
    table.specificType("reported_at", "TIMESTAMP(0) WITH TIME ZONE").nullable();
    table.specificType("occured_at", "TIMESTAMP(0) WITH TIME ZONE").nullable();
    table.specificType("created_at", "TIMESTAMP(0) WITH TIME ZONE").notNullable().defaultTo(knex.fn.now());
    

    table.foreign("source_id").references("data_injection_sources.id");
    table.foreign("incident_type_id").references("incident_types.id");
    table.foreign("status_code").references("incident_statuses.code");
    table.foreign("proxy_user_id").references("users.id");
    table.foreign("urgency_code").references("urgencies.code");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("data_injections");
}
