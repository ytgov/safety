import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("hazard_types", function (table) {
    table.increments("id").primary().notNullable();
    table.string("name", 256).notNullable();
    table.string("description", 4000).nullable();
    table.string("default_urgency_code").nullable();

    table.foreign("default_urgency_code").references("urgencies.code");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("hazard_types");
}
