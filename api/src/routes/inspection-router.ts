import express, { Request, Response } from "express";
import { isArray, isNil } from "lodash";

import { Knex } from "knex";
import { db as knex } from "../data/db-client";
import { InspectionService } from "../services";
import { Incident, IncidentAttachment, IncidentStatuses, SensitivityLevels, UserRole } from "../data/models";
import { InsertableDate } from "../utils/formatters";
import { DateTime } from "luxon";
import { generateSlug } from "../utils/generateSlug";

export const inspectionRouter = express.Router();
const db = new InspectionService();

inspectionRouter.get("/", async (req: Request, res: Response) => {
  const { page, perPage, search, status, urgency, location } = req.query;

  const pageNum = parseInt(page as string) || 1;
  let perPageNum = parseInt(perPage as string) || 10;

  if (perPageNum < 0) perPageNum = 1000;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter((role: UserRole) => role.name === "System Admin").length > 0;

  const countQuery = function (q: Knex.QueryBuilder) {
    if (!isNil(search)) q.whereRaw(`LOWER("incidents"."description") like '%${search.toString().toLowerCase()}%'`);
    if (!isNil(status)) q.where("status_code", status);
    if (!isNil(urgency)) q.where("urgency_code", urgency);
    if (!isNil(location)) q.where("location_code", location);
    return q;
  };

  const listQuery = function (q: Knex.QueryBuilder) {
    if (!isNil(search)) q.whereRaw(`LOWER("incidents"."description") like '%${search.toString().toLowerCase()}%'`);
    if (!isNil(status)) q.where("status_code", status);
    if (!isNil(urgency)) q.where("urgency_code", urgency);
    if (!isNil(location)) q.where("location_code", location);
    q.limit(perPageNum);
    q.offset((pageNum - 1) * perPageNum);
    return q;
  };

  const list = await db.getAll(userIsAdmin ? "System Admin" : req.user.email, listQuery);
  const count = await db.getCount(userIsAdmin ? "System Admin" : req.user.email, countQuery);

  const locations = await knex("locations");
  const inspectionLocations = await knex("inspection_locations");
  const types = await knex("incident_types");
  const statuses = await knex("incident_statuses");
  const access = await knex("incident_users_view").where({ user_email: req.user.email });

  for (const item of list) {
    item.location = locations.find((l: any) => l.code === item.location_code);
    item.type = types.find((t: any) => t.id === item.incident_type_id);
    item.status = statuses.find((s: any) => s.code === item.status_code);
    item.access = access.filter((a: any) => a.incident_id === item.id) ?? [];
    item.inspection_location = inspectionLocations.find((a: any) => a.id === item.inspection_location_id);
  }

  return res.json({ data: list, totalCount: count?.count });
});

inspectionRouter.get("/my-reports", async (req: Request, res: Response) => {
  const list = await db.getByReportingEmail(req.user.email);
  return res.json({ data: list });
});

inspectionRouter.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter((role: UserRole) => role.name === "System Admin").length > 0;

  const data = await db.getBySlug(slug, userIsAdmin ? "System Admin" : req.user.email);

  if (!data) return res.status(404).send();

  return res.json({ data });
});

inspectionRouter.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    description,
    investigation_notes,
    additional_description,
    urgency_code,
    incident_type_id,
    inspection_location_id,
  } = req.body;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter((role: UserRole) => role.name === "System Admin").length > 0;

  const data = await db.getById(id, userIsAdmin ? "System Admin" : req.user.email);
  if (!data) return res.status(404).send();

  await knex("incidents").where({ id }).update({
    description,
    investigation_notes,
    additional_description,
    urgency_code,
    incident_type_id,
    inspection_location_id,
  });

  return res.json({ data: {}, messages: [{ variant: "success", text: "Incident Saved" }] });
});

inspectionRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const trx = await knex.transaction();

  try {
    const linkedHazards = await trx("incident_hazards").where({ incident_id: id });
    await trx("incident_hazards").where({ incident_id: id }).delete();

    for (const link of linkedHazards) {
      await trx("actions").where({ hazard_id: link.hazard_id }).delete();
      await trx("hazard_attachments").where({ hazard_id: link.hazard_id }).delete();
      await trx("hazards").where({ id: link.hazard_id }).delete();
    }

    await trx("actions").where({ incident_id: id }).delete();
    await trx("incident_attachments").where({ incident_id: id }).delete();
    await trx("incident_steps").where({ incident_id: id }).delete();
    await trx("investigations").where({ incident_id: id }).delete();
    await trx("incident_users").where({ incident_id: id }).delete();
    await trx("incidents").where({ id }).delete();

    trx.commit();
    return res.json({ data: {}, messages: [{ variant: "success", text: "Incident Removed" }] });
  } catch (error) {
    console.log("ERROR IN TRANSACTION", error);
    trx.rollback();
    return res.json({ data: {}, messages: [{ variant: "error", text: "Error Removing Incident" }] });
  }
});

inspectionRouter.post("/", async (req: Request, res: Response) => {
  let { date, location_code, department_code, inspection_location_id } = req.body;

  const reporting_person_email = req.user.email;

  const defaultIncidentType = await knex("incident_types").where({ name: "inspection" }).select("id").first();

  const trx = await knex.transaction();

  try {
    const incident = {
      created_at: InsertableDate(DateTime.utc().toISO()),
      reported_at: InsertableDate(date),
      description: "Inspection by " + req.user.display_name,
      department_code,
      status_code: IncidentStatuses.OPEN.code,
      sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
      incident_type_id: defaultIncidentType.id,
      reporting_person_email,
      proxy_user_id: req.user.id,
      urgency_code: "Low",
      location_code,
      inspection_location_id,
      slug: generateSlug(),
    } as Incident;

    const insertedIncidents = await trx("incidents").insert(incident).returning("*");
    let insertedIncidentId = insertedIncidents[0].id;

    if (req.files && req.files.files) {
      let files = req.files.files;

      if (!isArray(files)) files = [files];

      for (const file of files) {
        let attachment = {
          incident_id: insertedIncidentId,
          added_by_email: req.user.email,
          file_name: file.name,
          file_type: file.mimetype,
          file_size: file.size,
          file: file.data,
          added_date: InsertableDate(DateTime.utc().toISO()),
        } as IncidentAttachment;

        await trx("incident_attachments").insert(attachment);
      }
    }

    await trx.commit();
    return res.json({ data: insertedIncidents[0] });
  } catch (error) {
    trx.rollback();
    console.log("ERROR IN TRANSACTION", error);
  }

  return res.status(400).json({ data: {} });
});
