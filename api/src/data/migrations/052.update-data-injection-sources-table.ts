import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injection_sources", (table) => {
    table.string("identifier_column_name", 250).notNullable().alter();
    table.integer("column_count").notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injection_sources", (table) => {
    table.string("identifier_column_name", 250).nullable().alter();
    table.integer("column_count").nullable().alter();
  });
}
