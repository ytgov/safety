import * as knex from "knex";

exports.up = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.createTable("incident_hazard", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("incident_id").notNullable().references("incident.incident_id");
        table.integer("hazard_id").notNullable().references("hazard.hazard_id");
        table.string("incident_hazard_type", 8).notNullable().references("incident_hazard_type.code");
        table.integer("priority_order").notNullable();
    });
};

exports.down = async function(knex: knex.Knex, Promise: any) {
    await knex.schema.dropTable("incident_hazard");
};
