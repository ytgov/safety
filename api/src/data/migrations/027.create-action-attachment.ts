import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("action_attachment", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("action_id").notNullable();
        table.string("added_by", 256).nullable(); // look into renaming this
        table.binary("thing").nullable(); // look into renaming this
        table.tinyint("deleted", 1).notNullable();
        table.string("deleted_by", 256).nullable();
        table.datetime("added_date").notNullable();
        table.datetime("deleted_date").notNullable();

        table.foreign("action_id").references("action.id");
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("action_attachment");
};
