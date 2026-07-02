import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("committee_meeting_members", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("committee_meeting_id").notNullable();
    table.integer("committee_id").notNullable();
    table.integer("user_id").nullable();
    table.string("email", 250).nullable();
    table.string("display_name", 256).nullable();

    table.foreign("committee_meeting_id").references("committee_meetings.id");
    table.foreign("committee_id").references("committees.id");
    table.foreign("user_id").references("users.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("committee_meeting_members");
}
