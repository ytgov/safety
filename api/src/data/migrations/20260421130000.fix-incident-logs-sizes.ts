import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("incident_logs", function (table) {
    table.string("old_supervisor", 250).alter();
    table.string("new_supervisor", 250).alter();
    table.string("old_sensitivity_code", 8).alter();
    table.string("user_action", 16).alter();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("incident_logs", function (table) {
    table.string("old_supervisor", 8).alter();
    table.string("new_supervisor", 8).alter();
    table.string("old_sensitivity_code", 256).alter();
    table.string("user_action", 8).alter();
  });
}
