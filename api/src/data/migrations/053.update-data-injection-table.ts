import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injections", (table) => {
    table.integer("incident_type_id").nullable().alter();
    table.string("status_code", 50).nullable().alter();

    table.date("reported_at").nullable().alter();
    table.date("occured_at").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("data_injections", (table) => {
    table.string("incident_type_id", 250).notNullable().alter();
    table.integer("status_code").notNullable().alter();

    table.specificType("reported_at", "TIMESTAMP(0) WITH TIME ZONE").nullable().alter();
    table.specificType("occured_at", "TIMESTAMP(0) WITH TIME ZONE").nullable().alter();
  });
}
