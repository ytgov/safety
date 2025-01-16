import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("user_roles", function (table) {
    table.increments("id").primary().notNullable();
    table.string("name", 256).nullable();
    table.string("department_code", 8).nullable();
    table.string("location_code", 8).nullable();
    table.integer("role_type_id").notNullable();
    table.integer("user_id").notNullable();
    table.specificType("created_at", "TIMESTAMP(0) WITH TIME ZONE").notNullable().defaultTo(knex.fn.now());
    table.integer("create_user_id").notNullable();
    table.specificType("start_date", "TIMESTAMP(0) WITH TIME ZONE").notNullable();
    table.specificType("end_date", "TIMESTAMP(0) WITH TIME ZONE").nullable();

    table.foreign("department_code").references("departments.code");
    table.foreign("location_code").references("locations.code");
    table.foreign("role_type_id").references("role_types.id");
    table.foreign("create_user_id").references("users.id");
    table.foreign("user_id").references("users.id");
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropTable("user_roles");
}
