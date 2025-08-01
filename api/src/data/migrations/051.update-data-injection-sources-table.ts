import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injection_sources", (table) => {
    table.string("identifier_column_name", 250).nullable();
    table.integer("column_count").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injection_sources", (table) => {
    table.dropColumn("identifier_column_name");
    table.dropColumn("column_count");
  });
}
