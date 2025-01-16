import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("investigations", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("hazard_id").nullable();
    table.integer("incident_id").nullable();
    table.integer("creator_user_id").nullable();
    table.text("investigation_data").nullable();
    
    table.foreign("hazard_id").references("hazards.id");
    table.foreign("incident_id").references("incidents.id");
    table.foreign("creator_user_id").references("users.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("investigations");
}
