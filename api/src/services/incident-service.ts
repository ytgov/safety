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
