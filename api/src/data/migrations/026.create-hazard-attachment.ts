import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("hazard_attachment", function(table) {
        table.increments("hazard_attachment_id").primary().notNullable();
        table.integer("hazard_id").notNullable().references("hazard.hazard_id");
        table.string("added_by", 256).nullable();
        // thing mediumblob null
        table.tinyint("deleted", 1).notNullable();
        table.string("deleted_by", 256).nullable();
        table.datetime("added_date").notNullable();
        table.datetime("deleted_date").notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("hazard_attachment");
};
