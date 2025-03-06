import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.createTable("incident_users", function (table) {
    table.increments("id").primary().notNullable();
    table.integer("incident_id").notNullable();
    table.string("user_email", 250).notNullable();
    table.string("reason", 50).nullable();

    table.foreign("incident_id").references("incidents.id");
  });

  await knex.schema.raw(`
    CREATE VIEW "incident_users_view" AS
    SELECT DISTINCT * FROM (
      SELECT "incident_id",  "user_email", "reason"
      FROM "incident_users"
      UNION
      SELECT "incident_id", "actor_user_email", 'action'
      FROM "actions"
      UNION
      SELECT "id", "reporting_person_email", 'reporter'
      FROM "incidents"
      UNION
      SELECT "id", "supervisor_email", 'supervisor'
      FROM "incidents") AS "t"
      ORDER BY 1,2,3`);
}

export async function down(knex: knex.Knex) {
  await knex.schema.dropView("incident_users_view");
  await knex.schema.dropTable("incident_users");
}
