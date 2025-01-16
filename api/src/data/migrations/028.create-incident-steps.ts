import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("incident_steps", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("incident_id").notNullable();
    table.string("step_title", 150).notNullable();
    table.integer("order").notNullable();
    table.specificType("activate_date", "TIMESTAMP(0) WITH TIME ZONE").nullable();
    table.specificType("complete_date", "TIMESTAMP(0) WITH TIME ZONE").nullable();
    table.string("complete_name", 200).nullable();
    table.integer("complete_user_id").nullable();

    table.foreign("incident_id").references("incidents.id");
    table.foreign("complete_user_id").references("users.id");
    table.unique(["incident_id", "order"]);
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("incident_steps");
}
