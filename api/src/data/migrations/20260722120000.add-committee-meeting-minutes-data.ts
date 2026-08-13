import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("committee_meetings", function (table) {
    // Structured wizard payload stored as JSON (method + the guided sections:
    // discussion items, hazards, assessments, work refusals). Mirrors the
    // investigations.investigation_data pattern — a text column holding JSON.
    table.text("minutes_data").nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("committee_meetings", function (table) {
    table.dropColumn("minutes_data");
  });
}
