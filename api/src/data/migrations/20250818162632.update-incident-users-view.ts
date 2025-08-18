import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex.schema.raw(`DROP VIEW "incident_users_view"`);

  await knex.schema.raw(`
    CREATE VIEW "incident_users_view" AS
    SELECT DISTINCT * FROM (
      SELECT "incident_id",  "user_email", "reason"
      FROM "incident_users"
      UNION
      SELECT "id", 'System Admin', 'System Admin'
      FROM "incidents"
      UNION
      SELECT "incident_id", "actor_user_email", 'action'
      FROM "actions"
      UNION
      SELECT "id", "reporting_person_email", 'reporter'
      FROM "incidents"
      UNION
      SELECT "id", "supervisor_email", 'supervisor'
      FROM "incidents"
      UNION
      SELECT "incidents"."id", "users"."email", "role_types"."name" 
      FROM "incidents" 
      INNER JOIN "user_roles" ON ("incidents"."department_code" = "user_roles"."department_code")
      INNER JOIN "users" ON ("users"."id" = "user_roles"."user_id")
      INNER JOIN "role_types" ON "user_roles"."role_type_id" = "role_types"."id"
      WHERE "user_roles"."role_type_id" IN (8,9)
      UNION
      SELECT "incidents"."id", "users"."email", 'committee'
      FROM "committees"
      INNER JOIN "committee_users" ON "committees"."id" = "committee_users"."committee_id"
      INNER JOIN "users" ON "users"."id" = "committee_users"."user_id"
      INNER JOIN "incidents" ON "incidents"."department_code" = "committees"."department_code"
      INNER JOIN "incident_types" ON "incident_types"."id" = "incidents"."incident_type_id" AND "incident_types"."name" = 'inspection'
      ) "t"
      ORDER BY 1,2,3`);
}

export async function down(knex: knex.Knex) {
  await knex.schema.raw(`DROP VIEW "incident_users_view"`);

  await knex.schema.raw(`
    CREATE VIEW "incident_users_view" AS
    SELECT DISTINCT * FROM (
      SELECT "incident_id",  "user_email", "reason"
      FROM "incident_users"
      UNION
      SELECT "id", 'System Admin', 'System Admin'
      FROM "incidents"
      UNION
      SELECT "incident_id", "actor_user_email", 'action'
      FROM "actions"
      UNION
      SELECT "id", "reporting_person_email", 'reporter'
      FROM "incidents"
      UNION
      SELECT "id", "supervisor_email", 'supervisor'
      FROM "incidents"
      UNION
      SELECT "incidents"."id", "users"."email", "role_types"."name" 
      FROM "incidents" 
      INNER JOIN "user_roles" ON ("incidents"."department_code" = "user_roles"."department_code")
      INNER JOIN "users" ON ("users"."id" = "user_roles"."user_id")
      INNER JOIN "role_types" ON "user_roles"."role_type_id" = "role_types"."id"
      WHERE "user_roles"."role_type_id" IN (8,9)
      ) "t"
      ORDER BY 1,2,3`);
}
