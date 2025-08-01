import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injections", (table) => {
    table.text("description").nullable().alter();
    table.text("description_moderated").nullable().alter();
    table.text("location_detail").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injections", (table) => {
    table.string("description", 255).notNullable().alter();
    table.string("description_moderated", 255).notNullable().alter();
    table.string("location_detail", 255).notNullable().alter();
  });
}
