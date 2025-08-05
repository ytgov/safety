import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("data_ingestions", function (table) {
    table.increments("id").notNullable().primary();
    table.integer("source_id").notNullable();
    table.string("identifier", 100).notNullable();
    table.integer("incident_type_id").notNullable();
    table.string("status_code", 50).nullable();
    table.integer("proxy_user_id").nullable();
    table.text("description").nullable();
    table.text("description_moderated").nullable();
    table.string("urgency_code", 8).nullable();
    table.text("location_detail").nullable();
    table.date("reported_at").nullable();
    table.date("occured_at").nullable();
    table
      .specificType("created_at", "TIMESTAMP(0) WITH TIME ZONE")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.foreign("source_id").references("data_ingestion_sources.id");
    table.foreign("incident_type_id").references("incident_types.id");
    table.foreign("status_code").references("incident_statuses.code");
    table.foreign("proxy_user_id").references("users.id");
    table.foreign("urgency_code").references("urgencies.code");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("data_ingestions");
}
