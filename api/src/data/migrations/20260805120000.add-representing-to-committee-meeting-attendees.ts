import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("committee_meeting_cochairs", function (table) {
    table.string("representing", 32).nullable();
  });

  await knex.schema.alterTable("committee_meeting_members", function (table) {
    table.string("representing", 32).nullable();
  });

  // Existing attendees pre-date the Employee/Employer distinction; assume Employee.
  await knex("committee_meeting_cochairs").update({ representing: "Employee" });
  await knex("committee_meeting_members").update({ representing: "Employee" });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("committee_meeting_cochairs", function (table) {
    table.dropColumn("representing");
  });

  await knex.schema.alterTable("committee_meeting_members", function (table) {
    table.dropColumn("representing");
  });
}
