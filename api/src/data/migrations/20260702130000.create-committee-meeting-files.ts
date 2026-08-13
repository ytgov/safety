import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("committee_meeting_files", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("committee_meeting_id").notNullable();
    table.specificType("added_date", "TIMESTAMP(0) WITH TIME ZONE").notNullable().defaultTo(knex.fn.now());
    table.string("added_by_email", 250).nullable();
    table.integer("added_by_user_id").nullable();
    table.string("file_name", 256).nullable();
    table.string("file_type", 256).nullable();
    table.integer("file_size").nullable();
    table.binary("file").nullable();

    table.foreign("committee_meeting_id").references("committee_meetings.id");
    table.foreign("added_by_user_id").references("users.id");
  });

  await knex.schema.alterTable("committee_meetings", function (table) {
    table.dropColumn("minutes_file_name");
    table.dropColumn("minutes_file_type");
    table.dropColumn("minutes_file_size");
    table.dropColumn("minutes_file");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("committee_meetings", function (table) {
    table.string("minutes_file_name", 256).nullable();
    table.string("minutes_file_type", 256).nullable();
    table.integer("minutes_file_size").nullable();
    table.binary("minutes_file").nullable();
  });

  await knex.schema.dropTable("committee_meeting_files");
}
