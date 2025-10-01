import { Incident } from "../data/models";
import { db } from "../data/db-client";
import { Knex } from "knex";
import { isArray } from "lodash";
import { unparse } from "papaparse";
import { FormatDate } from "@/utils/formatters";

export class IncidentService {
  async getAll(email: string, where: (query: Knex.QueryBuilder) => Knex.QueryBuilder): Promise<Incident[]> {
    return db<Incident>("incidents")
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
      .whereRaw(`"incidents"."id" IN (SELECT "incident_id" FROM "incident_users_view" WHERE "user_email" = ?)`, [email])
      .whereNot("incident_types.name", "inspection")
      .modify(where)
      .select(
        "incidents.*",
        "incident_types.name as incident_type_name",
        "incident_types.description as incident_type_description",
        "incident_statuses.name as status_name",
        "departments.name as department_name"
      )
      .orderBy("incidents.created_at", "desc");
  }
  async getCount(email: string, where: (query: Knex.QueryBuilder) => Knex.QueryBuilder): Promise<{ count: number }> {
    return db<Incident>("incidents")
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
      .whereRaw(`"incidents"."id" IN (SELECT "incident_id" FROM "incident_users_view" WHERE LOWER("user_email") = ?)`, [
        email.toLowerCase(),
      ])
      .whereNot("incident_types.name", "inspection")
      .modify(where)
      .count("* as count")
      .first();
  }

  async getBySlug(slug: string, email: string): Promise<Incident | undefined> {
    const item = await db("incidents").where({ slug }).first();
    if (!item) return undefined;
    return this.getById(item.id, email);
  }

  async getById(id: number | string, email: string): Promise<Incident | undefined> {
    const item = await db("incidents")
      .where("incidents.id", parseInt(`${id}`))
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
      .innerJoin("locations", "incidents.location_code", "locations.code")
      .whereRaw(`"incidents"."id" IN (SELECT "incident_id" FROM "incident_users_view" WHERE LOWER("user_email") = ?)`, [
        email.toLowerCase(),
      ])
      .whereNot("incident_types.name", "inspection")
      .select<Incident>(
        "incidents.*",
        "incident_types.name as incident_type_name",
        "incident_types.description as incident_type_description",
        "incident_statuses.name as status_name",
        "departments.name as department_name",
        db.raw(`CONCAT(CONCAT("locations"."name", ': '), "locations"."community") as location_name`)
      )
      .first();

    if (!item) return item;
    ``;
    item.attachments = await db("incident_attachments")
      .where({ incident_id: item.id })
      .select("id", "incident_id", "added_by_email", "file_name", "file_type", "file_size", "added_date");

    item.steps = await db("incident_steps").where({ incident_id: item.id }).orderBy("order");
    item.actions = await db("actions").where({ incident_id: item.id }).orderBy("due_date").orderBy("id");
    item.investigation = await db("investigations").where({ incident_id: item.id }).first();
    item.access = await db("incident_users_view").where({
      incident_id: item.id,
      user_email: email,
    });

    if (item.investigation) {
      item.investigation.investigation_data = JSON.parse(item.investigation.investigation_data);
    }

    item.hazards = await db("incident_hazards")
      .where({ incident_id: item.id })
      .innerJoin("incident_hazard_types", "incident_hazards.incident_hazard_type_code", "incident_hazard_types.code")
      .select("incident_hazards.*", "incident_hazard_types.name as incident_hazard_type_name");

    for (let hazard of item.hazards ?? []) {
      hazard.hazard = await db("hazards")
        .where({ "hazards.id": hazard.hazard_id })
        .innerJoin("hazard_types", "hazards.hazard_type_id", "hazard_types.id")
        .innerJoin("locations", "hazards.location_code", "locations.code")
        .select(
          "hazards.*",
          "hazard_types.name as hazard_type_name",
          db.raw(`CONCAT(CONCAT("locations"."name", ': '), "locations"."community") as location_name`)
        )
        .first();
    }

    for (let action of item.actions) {
      if (action.actor_role_type_id) {
        action.actor_display_name = (
          await db("role_types").where({ id: action.actor_role_type_id }).first()
        ).description;
      } else if (action.actor_user_id) {
        action.actor_display_name = (await db("users").where({ id: action.actor_user_id }).first()).display_name;
      } else if (action.actor_user_email) {
        action.actor_display_name = action.actor_user_email;
      }

      action.categories = action.categories ?? [];
      if (!isArray(action.categories)) action.categories = action.categories.split(",").filter((c) => c);
    }

    return item;
  }

  async getByReportingEmail(email: string): Promise<Incident[]> {
    return db<Incident>("incidents")
      .where("incident_users_view.reason", "reporter")
      .whereNotIn("status_code", ["Closed", "Dup", "NoAct"])
      .whereNot("incident_types.name", "inspection")
      .innerJoin("incident_users_view", "incidents.id", "incident_users_view.incident_id")
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
      .whereRaw(`LOWER("incident_users_view"."user_email") = '${email.toLowerCase()}'`)
      .select(
        "incidents.*",
        "incident_types.name as incident_type_name",
        "incident_types.description as incident_type_description",
        "incident_statuses.name as status_name",
        "departments.name as department_name"
      );
  }

  async getBySupervisorEmail(email: string): Promise<Incident[]> {
    return db<Incident>("incidents")
      .where("incident_users_view.reason", "supervisor")
      .whereNot("incident_types.name", "inspection")
      .whereNotIn("status_code", ["Closed", "Dup", "NoAct"])
      .innerJoin("incident_users_view", "incidents.id", "incident_users_view.incident_id")
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
      .whereRaw(`LOWER("incident_users_view"."user_email") = '${email.toLowerCase()}'`)
      .select(
        "incidents.*",
        "incident_types.name as incident_type_name",
        "incident_types.description as incident_type_description",
        "incident_statuses.name as status_name",
        "departments.name as department_name"
      );
  }

  async create(item: any): Promise<Incident[]> {
    return db("incidents").insert(item).returning("*");
  }

  async update(id: number, item: any): Promise<Incident> {
    return db("incidents").where({ id }).update(item);
  }

  generateIncidentsCsvString(reports: Incident[], showSupervisor: boolean): string {
      { title: "Id", value: "identifier" },
    if (showSupervisor) {
      const data = reports.map((report) => ({
        Id: report.identifier,
        Description: report.description,
        Status: report.status?.name,
        Urgency: report.urgency_code,
        Identified: report.created_at ? FormatDate(report.created_at as Date) : "",
        Location: report.location?.name,
        Supervisor: report.supervisor_email || "",
      }));

      return unparse(data, { skipEmptyLines: true });
    } else {
      const data = reports.map((report) => ({
        Id: report.identifier,
        Description: report.description,
        Status: report.status?.name,
        Urgency: report.urgency_code,
        Identified: report.created_at ? FormatDate(report.created_at as Date) : "",
        Location: report.location?.name,
      }));

      return unparse(data);
    }
  }
}
