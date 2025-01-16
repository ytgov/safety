import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("incident_attachments", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("incident_id").notNullable();
    table.specificType("added_date", "TIMESTAMP(0) WITH TIME ZONE").notNullable().defaultTo(knex.fn.now());
    table.string("added_by_email", 250).notNullable();
    table.string("file_name", 256).nullable();
    table.string("file_type", 256).nullable();
    table.integer("file_size").nullable();
    table.binary("file").nullable();
    table.boolean("is_deleted").notNullable().defaultTo(false);
    table.integer("deleted_by_user_id").nullable();
    table.specificType("deleted_date", "TIMESTAMP(0) WITH TIME ZONE").nullable();

    table.foreign("incident_id").references("incidents.id");
    table.foreign("deleted_by_user_id").references("users.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("incident_attachments");
}
