import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("incident_hazard_logs", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("incident_hazard_id").notNullable();
    table.string("old_incident_hazard_type_code", 8).nullable();
    table.string("new_incident_hazard_type_code", 8).nullable();
    table.integer("changer_user_id").nullable();
    table.integer("changer_role_id").nullable();
    table.specificType("changed_date", "TIMESTAMP(0) WITH TIME ZONE").notNullable();
    table.string("log_title", 200).notNullable();
    table.string("log_comment", 4000).notNullable();
    table.string("user_action", 8).notNullable();

    table.foreign("incident_hazard_id").references("incident_hazards.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("incident_hazard_logs");
}
