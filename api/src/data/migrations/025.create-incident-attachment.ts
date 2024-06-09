import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("incident_attachment", function(table) {
        table.increments("incident_attachment_id").primary().notNullable();
        table.integer("incident_id").notNullable().references("incident.incident_id"); // confirm valid reference
        table.string("added_by", 256).nullable();
        // thing mediumblob null
        table.tinyint("deleted", 1).notNullable();
        table.string("deleted_by", 256).nullable();
        table.datetime("added_date").notNullable();
        table.datetime("deleted_date").notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("incident_attachment");
};
