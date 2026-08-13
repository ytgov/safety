import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("committee_meetings", function (table) {
    table.string("quorum", 3).nullable();
    table.string("meet_anyway", 3).nullable();
    table.integer("no_loss_incidents_reviewed").nullable();
    table.integer("loss_incidents_reviewed").nullable();
    table.integer("new_hazards_reviewed").nullable();
    table.string("worker_vacancies", 3).nullable();
    table.integer("worker_vacancy_count").nullable();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("committee_meetings", function (table) {
    table.dropColumn("quorum");
    table.dropColumn("meet_anyway");
    table.dropColumn("no_loss_incidents_reviewed");
    table.dropColumn("loss_incidents_reviewed");
    table.dropColumn("new_hazards_reviewed");
    table.dropColumn("worker_vacancies");
    table.dropColumn("worker_vacancy_count");
  });
}
