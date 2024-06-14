import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("action_attachments", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("action_id").notNullable();
        table.string("added_by", 256).nullable(); // look into renaming this
        table.binary("file").nullable();
        table.tinyint("deleted", 1).notNullable();
        table.string("deleted_by", 256).nullable();
        table.datetime("added_date").notNullable();
        table.datetime("deleted_date").notNullable();

        table.foreign("action_id").references("action.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("action_attachments");
};
