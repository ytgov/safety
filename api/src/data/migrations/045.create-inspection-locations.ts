import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("buildings", function (table) {
    table.increments("id").primary().notNullable();
    table.string("name", 256).notNullable();
    table.string("description", 2000).nullable();
    table.string("identifier", 200).nullable();
    table.string("location_code", 8).nullable();

    table.foreign("location_code").references("locations.code");
  });

  await knex.schema.createTable("inspection_locations", function (table) {
    table.increments("id").primary().notNullable();
    table.string("name", 256).notNullable();
    table.string("description", 2000).nullable();
    table.string("department_code", 8).nullable();
    table.integer("building_id").nullable();

    table.foreign("department_code").references("departments.code");
    table.foreign("building_id").references("buildings.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("inspection_locations");
  await knex.schema.dropTable("buildings");
}
