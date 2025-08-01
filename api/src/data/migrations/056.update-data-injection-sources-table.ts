import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injection_sources", (table) => {
    table.string("source_attribute_to_transform").nullable();
    table.string("target_attribute_to_transform").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injection_sources", (table) => {
    table.dropColumn("source_attribute_to_transform");
    table.dropColumn("target_attribute_to_transform");
  });
}
