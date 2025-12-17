import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.integer("is_committee_task").nullable();
    table.string("committee_supervisor_response", 500).nullable();
    table.string("committee_task_rationale", 2000).nullable();
    table.text("comments").nullable();
  });

  await knex("actions").whereNull("is_committee_task").update({ is_committee_task: 0 });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.dropColumn("is_committee_task");
    table.dropColumn("committee_supervisor_response");
    table.dropColumn("committee_task_rationale");
    table.dropColumn("comments");
  });
}
