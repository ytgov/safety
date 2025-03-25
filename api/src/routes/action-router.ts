import express, { Request, Response } from "express";
import { Knex } from "knex";
import { isEmpty, isNil } from "lodash";
import { DateTime } from "luxon";

import { db as knex } from "../data";
import {
  Action,
  ActionStatuses,
  ActionTypes,
  Hazard,
  HazardStatuses,
  IncidentHazard,
  IncidentHazardTypes,
  Scopes,
  SensitivityLevels,
  UserRole,
} from "../data/models";
import { InsertableDate } from "../utils/formatters";
import { generateSlug } from "../utils/generateSlug";
import { updateActionHazards, updateIncidentStatus } from "./report-router";
import { EmailService } from "../services";
import { ActionService } from "../services/action-service";

const db = new ActionService();
const emailService = new EmailService();

export const actionRouter = express.Router();

actionRouter.get("/", async (req: Request, res: Response) => {
  const { page, perPage, search, status, review } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const perPageNum = parseInt(perPage as string) || 10;

  const isAdmin = req.user.roles.filter((r: any) => r.name == "System Admin").length > 0;

  const countQuery = function (q: Knex.QueryBuilder) {
    if (!isNil(search)) q.whereRaw(`LOWER("description") like '%${search.toString().toLowerCase()}%'`);
    if (!isNil(status)) {
      if (status == "Dashboard") {
        q.whereIn("status_code", [ActionStatuses.OPEN.code, ActionStatuses.READY.code]);
      } else {
        q.where("status_code", status);
      }
    }
    if (!isNil(review)) q.where("hazard_review", parseInt(`${review}`));
    if (isAdmin && status == "Dashboard") q.where("actor_user_email", req.user.email);
    else if (!isAdmin) q.where("actor_user_email", req.user.email);

    return q;
  };

  const listQuery = function (q: Knex.QueryBuilder) {
    if (!isNil(search)) q.whereRaw(`LOWER(actions.description) like '%${search.toString().toLowerCase()}%'`);
    if (!isNil(status)) {
      if (status == "Dashboard") {
        q.whereIn(`actions.status_code`, [ActionStatuses.OPEN.code, ActionStatuses.READY.code]);
      } else {
        q.where(`actions.status_code`, status);
      }
    }
    if (!isNil(review)) q.where("hazard_review", parseInt(`${review}`));
    if (isAdmin && status == "Dashboard") q.where(`actions.actor_user_email`, req.user.email);
    else if (!isAdmin) q.where(`actions.actor_user_email`, req.user.email);

    q.limit(perPageNum);
    q.offset((pageNum - 1) * perPageNum);
    return q;
  };

  const list = await db.getAll(req.user.email, listQuery);
  const count = await db.getCount(req.user.email, countQuery);

  const types = await knex("action_types");
  const statuses = await knex("action_statuses");

  for (const item of list) {
    item.type = types.find((t: any) => t.id === item.action_type_code);
    item.status = statuses.find((s: any) => s.code === item.status_code);
  }

  return res.json({ data: list, totalCount: count?.count });
});

actionRouter.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter((role: UserRole) => role.name === "System Admin").length > 0;

  const listQuery = function (q: Knex.QueryBuilder) {
    q.where("actions.slug", slug);
    return q;
  };

  const list = await db.getAll(userIsAdmin ? "System Admin" : req.user.email, listQuery);

  if (list && list[0]) {
    const item = list[0];
    const types = await knex("action_types");
    const statuses = await knex("action_statuses");

    item.type = types.find((t: any) => t.id === item.action_type_code);
    item.status = statuses.find((s: any) => s.code === item.status_code);
    item.categories = ((item.categories as string) ?? "").split(",");
    return res.json({ data: item });
  }

  res.status(404).send("Action Not Found");
});

actionRouter.post("/", async (req: Request, res: Response) => {
  const {
    incident_id,
    description,
    notes,
    actor_user_email,
    actor_user_id,
    actor_display_name,
    actor_role_type_id,
    due_date,
    hazard_type_id,
    urgency_code,
  } = req.body;

  const incident = await knex("incidents")
    .innerJoin("incident_types", "incidents.incident_type_id", "incident_types.id")
    .where(`incidents.id`, incident_id)
    .select("incidents.*", "incident_types.description as incident_type_description")
    .first();

  let hazard_id = undefined;

  const action = {
    incident_id,
    hazard_id,
    created_at: InsertableDate(DateTime.utc().toISO()),
    description: `${incident.incident_type_description.replace(/\(.*\)/g, "")} ${description}`,
    notes,
    action_type_code: ActionTypes.USER_GENERATED.code,
    sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
    status_code: ActionStatuses.OPEN.code,
    actor_user_email,
    actor_user_id,
    actor_role_type_id,
    due_date: InsertableDate(due_date),
    slug: generateSlug(),
    hazard_review: 0,
  } as Action;

  await knex("actions").insert(action);

  if (actor_user_email) {
    await emailService.sendTaskAssignmentNotification(
      { fullName: actor_display_name, email: actor_user_email },
      action,
      incident
    );
  }

  return res.json({ data: {}, messages: [{ variant: "success", text: "Task Saved" }] });
});

actionRouter.put("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const {
    notes,
    actor_user_email,
    actor_role_type_id,
    due_date,
    status_code,
    urgency_code,
    control,
    categories,
    title,
  } = req.body;
  let { actor_user_id } = req.body;

  const action = await knex("actions").where({ slug }).first();
  if (!action) return res.status(404).send();

  const incident = await knex("incidents").where({ id: action.incident_id }).first();

  if (incident && !isEmpty(actor_user_email)) {
    const actorUser = await knex("users").where({ email: actor_user_email }).first();
    if (actorUser) actor_user_id = actorUser.id;

    if (action.actor_user_email != actor_user_email) {
      await emailService.sendTaskAssignmentNotification(
        { fullName: actorUser?.display_name ?? actor_user_email, email: actor_user_email },
        action,
        incident
      );
    }
  }

  let newCategories = categories ?? [];

  await knex("actions")
    .where({ slug })
    .update({
      notes,
      actor_user_email,
      actor_user_id,
      actor_role_type_id,
      due_date: InsertableDate(due_date),
      status_code,
      control,
      categories: newCategories.join(","),
      title,
    });

  await updateActionHazards(action, status_code, urgency_code, control);
  await updateIncidentStatus(action, req.user);

  return res.json({ data: {} });
});

actionRouter.delete(":slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  await knex("actions").where({ slug }).delete();
  return res.json({ data: {} });
});

actionRouter.put("/:slug/:operation", async (req: Request, res: Response) => {
  const { slug, operation } = req.params;
  const { control, notes, hazard_review } = req.body;

  const action = await knex("actions").where({ slug }).first();
  if (!action) return res.status(404).send();

  if (operation == "complete") {
    await knex("actions")
      .where({ slug })
      .update({
        complete_date: InsertableDate(DateTime.utc().toISO()),
        complete_name: req.user.display_name,
        complete_user_id: req.user.id,
        status_code: ActionStatuses.COMPLETE.code,
        control,
        notes,
      });

    await updateActionHazards(action, ActionStatuses.COMPLETE.code, action.urgency_code, control);
    await updateIncidentStatus(action, req.user);
  } else if (operation == "revert") {
    await knex("actions").where({ slug }).update({
      complete_date: null,
      complete_name: null,
      complete_user_id: null,
      status_code: ActionStatuses.READY.code,
      control: null,
    });

    await updateActionHazards(action, ActionStatuses.OPEN.code, action.urgency_code, null);
    await updateIncidentStatus(action, req.user);
  } else if (operation == "hazard") {
    let hazard_id = null;
    if (hazard_review == 1) {
      const incident = await knex("incidents").where({ id: action.incident_id }).first();

      const hazard = {
        hazard_type_id: 1,
        location_code: incident.location_code,
        department_code: incident.department_code,
        scope_code: Scopes.DEFAULT.code,
        status_code: HazardStatuses.OPEN.code,
        sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
        description: `Hazard: ${action.description}`,
        location_detail: incident.location_detail,
        reopen_count: 0,
        created_at: InsertableDate(DateTime.utc().toISO()),
        reported_at: incident.reported_at,
        urgency_code: "Low",
        categories: action.categories,
      } as Hazard;

      const insertedHazards = await knex("hazards").insert(hazard).returning("*");
      hazard_id = insertedHazards[0].id;

      const link = {
        hazard_id: hazard_id,
        incident_id: incident.id,
        priority_order: 1,
        incident_hazard_type_code: IncidentHazardTypes.CONTRIBUTING_FACTOR.code,
      } as IncidentHazard;

      await knex("incident_hazards").insert(link);
    }

    await knex("actions").where({ slug }).update({
      complete_date: null,
      complete_name: null,
      complete_user_id: null,
      status_code: ActionStatuses.READY.code,
      control: null,
      hazard_review,
      hazard_id,
    });
  }

  return res.json({ data: {} });
});
