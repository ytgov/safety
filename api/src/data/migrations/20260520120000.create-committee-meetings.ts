import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("committee_meetings", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("committee_id").notNullable();
    table.date("meeting_date").notNullable();
    table.text("minutes").nullable();
    table.string("minutes_file_name", 256).nullable();
    table.string("minutes_file_type", 256).nullable();
    table.integer("minutes_file_size").nullable();
    table.binary("minutes_file").nullable();
    table.integer("created_by_user_id").nullable();
    table.string("status", 32).notNullable().defaultTo("Draft");
    table.specificType("completed_at", "TIMESTAMP(0) WITH TIME ZONE").nullable();
    table.integer("completed_by_user_id").nullable();
    table.specificType("created_at", "TIMESTAMP(0) WITH TIME ZONE").notNullable().defaultTo(knex.fn.now());

    table.foreign("committee_id").references("committees.id");
    table.foreign("created_by_user_id").references("users.id");
    table.foreign("completed_by_user_id").references("users.id");
  });

  await knex.schema.createTable("committee_meeting_cochairs", function (table) {
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
  await knex.schema.dropTable("committee_meeting_cochairs");
  await knex.schema.dropTable("committee_meetings");
}
