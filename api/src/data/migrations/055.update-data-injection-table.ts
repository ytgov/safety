import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injections", (table) => {
    table.dropColumn("reported_at");
    table.dropColumn("occured_at");
  });
  await knex.schema.alterTable("data_injections", (table) => {
    table.date("reported_at").nullable();
    table.date("occured_at").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injections", (table) => {
    table.dropColumn("reported_at");
    table.dropColumn("occured_at");
  });
  await knex.schema.alterTable("data_injections", (table) => {
    table.specificType("reported_at", "TIMESTAMP(0) WITH TIME ZONE").nullable();
    table.specificType("occured_at", "TIMESTAMP(0) WITH TIME ZONE").nullable();
  });
}
