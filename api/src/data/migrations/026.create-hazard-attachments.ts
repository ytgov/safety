import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("hazard_attachments", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("hazard_id").notNullable();
        table.string("added_by_email", 256).nullable();
        table.string("file_name", 256).nullable();
        table.string("file_type", 256).nullable();
        table.integer("file_size").nullable();
        table.binary("file").nullable();
        table.tinyint("deleted", 1).notNullable();
        table.string("deleted_by", 256).nullable();
        table.datetime("added_date").notNullable();
        table.datetime("deleted_date").notNullable();

        table.foreign("hazard_id").references("hazards.id");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("hazard_attachments");
};
