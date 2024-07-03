import { Incident } from "../data/models";
import { db } from "../data";

export class IncidentService {
  async getAll(): Promise<Incident[]> {
    return db<Incident>("incidents")
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
      .select(
        "incidents.*",
        "incident_types.name as incident_type_name",
        "incident_types.description as incident_type_description",
        "incident_statuses.name as status_name",
        "departments.name as department_name"
      );
  }

  async getById(id: number | string): Promise<Incident | undefined> {
    const item = await db("incidents")
      .where("incidents.id", parseInt(`${id}`))
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
      .select<Incident>(
        "incidents.*",
        "incident_types.name as incident_type_name",
        "incident_types.description as incident_type_description",
        "incident_statuses.name as status_name",
        "departments.name as department_name"
      )
      .first();

    if (!item) return item;

    item.attachments = await db("incident_attachments")
      .where({ incident_id: item.id })
      .select("id", "incident_id", "added_by_email", "file_name", "file_type", "file_size", "added_date");

    item.steps = await db("incident_steps").where({ incident_id: item.id }).orderBy("order");
    item.actions = await db("actions").where({ incident_id: item.id }).orderBy("due_date");
    item.hazards = await db("incident_hazards").where({ incident_id: item.id });

    for (let hazard of item.hazards) {
      hazard.hazard = await db("hazards").where({ id: hazard.hazard_id }).first();
    }

    for (let hazard of item.hazards) {
      hazard.hazard = await db("hazards").where({ id: hazard.hazard_id }).first();
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
    }

    return item;
  }

  async getByReportingEmail(email: string): Promise<Incident[]> {
    return db<Incident>("incidents")
      .where({ reporting_person_email: email })
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
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
      .where({ supervisor_email: email })
      .innerJoin("incident_types", "incident_types.id", "incidents.incident_type_id")
      .innerJoin("incident_statuses", "incident_statuses.code", "incidents.status_code")
      .innerJoin("departments", "departments.code", "incidents.department_code")
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
}
