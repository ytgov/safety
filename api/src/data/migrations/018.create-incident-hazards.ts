import * as knex from "knex";

export async function up(knex: knex.Knex) {
    await knex.schema.createTable("incident_hazards", function(table) {
        table.increments("id").primary().notNullable();
        table.integer("incident_id").notNullable();
        table.integer("hazard_id").notNullable();
        table.string("incident_hazard_type", 8).notNullable();
        table.integer("priority_order").notNullable();

        table.foreign("incident_id").references("incident.id");
        table.foreign("hazard_id").references("hazard.id");
        table.foreign("incident_hazard_type").references("incident_hazard_type.code");
    });
};

export async function down(knex: knex.Knex) {
    await knex.schema.dropTable("incident_hazards");
};
