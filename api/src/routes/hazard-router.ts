import express, { Request, Response } from "express";
import { db as knex } from "../data/db-client";
import { InsertableDate } from "../utils/formatters";
import { isArray, isEmpty, isNil } from "lodash";
import { Action, ActionStatuses, HazardStatuses } from "../data/models";
import { DateTime } from "luxon";

export const hazardRouter = express.Router();

hazardRouter.get("/", async (req: Request, res: Response) => {
  const { page, perPage, search, status, urgency, location, category } = req.query;
  const listQuery = knex("hazards");
  const countQuery = knex("hazards");

  const pageNum = parseInt(page as string) || 1;
  const perPageNum = parseInt(perPage as string) || 10;

  if (isEmpty())
    if (!isNil(search)) {
      listQuery.whereRaw(`LOWER("description") like '%${search.toString().toLowerCase()}%'`);
      countQuery.whereRaw(`LOWER("description") like '%${search.toString().toLowerCase()}%'`);
    }
  if (!isNil(status)) {
    const statusList = `${status}`.split(",");

    listQuery.whereIn("status_code", statusList);
    countQuery.whereIn("status_code", statusList);
  }
  if (!isNil(urgency)) {
    listQuery.where("urgency_code", urgency);
    countQuery.where("urgency_code", urgency);
  }
  if (!isNil(location)) {
    listQuery.where("location_code", location);
    countQuery.where("location_code", location);
  }
  if (!isNil(category)) {
    listQuery.whereILike("categories", `%${category}%`);
    countQuery.whereILike("categories", `%${category}%`);
  }

  const count = await countQuery.count("* as count").first();
  const list = await listQuery
    .select("*")
    .limit(perPageNum)
    .orderBy("created_at", "desc")
    .offset((pageNum - 1) * perPageNum);

  const locations = await knex("locations");
  const types = await knex("hazard_types");
  const actions = await knex("actions").whereNotNull("hazard_id");
  const statuses = await knex("hazard_statuses");

  for (const hazard of list) {
    hazard.location = locations.find((l: any) => l.code === hazard.location_code);
    hazard.type = types.find((t: any) => t.id === hazard.hazard_type_id);
    hazard.actions = actions.filter((a) => a.hazard_id === hazard.id);
    hazard.status = statuses.find((s: any) => s.code === hazard.status_code);
    hazard.categories = ((hazard.categories as string) ?? "").split(",");

    let dueDate = DateTime.now().plus({ days: 30 });

    for (let action of hazard.actions) {
      if (action.due_date) {
        const dt = DateTime.fromJSDate(action.due_date);
        if (dt.isValid && dt < dueDate) dueDate = dt;
      }

      hazard.due_date = dueDate.toISODate();

      if (action.actor_role_type_id) {
        action.actor_display_name = (
          await knex("role_types").where({ id: action.actor_role_type_id }).first()
        ).description;
      } else if (action.actor_user_id) {
        action.actor_display_name = (await knex("users").where({ id: action.actor_user_id }).first()).display_name;
      } else if (action.actor_user_email) {
        action.actor_display_name = action.actor_user_email;
      }

      if (!isEmpty(action.actor_display_name)) hazard.assigned_to = action.actor_display_name;
      action.categories = ((action.categories as string) ?? "").split(",");
    }
  }

  return res.json({ data: list, totalCount: count?.count });
});

hazardRouter.put("/:id/action", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes, actor_user_email, actor_role_type_id, due_date, status_code, urgency_code } = req.body;
  let { actor_user_id } = req.body;

  const hazard = await knex("hazards").where({ id }).first();
  if (!hazard) return res.status(404).send();

  let hazardStatus = HazardStatuses.OPEN.code;

  if (status_code == ActionStatuses.READY.code) hazardStatus = HazardStatuses.IN_PROGRESS.code;
  if (status_code == ActionStatuses.COMPLETE.code) hazardStatus = HazardStatuses.REMEDIATED.code;

  await knex("hazards").where({ id: hazard.id }).update({ urgency_code, status_code: hazardStatus });

  await knex("actions")
    .where({ hazard_id: id })
    .update({
      notes,
      actor_user_email,
      actor_user_id,
      actor_role_type_id,
      due_date: InsertableDate(due_date),
      status_code,
    });

  if (!isEmpty(actor_user_email)) {
    const actorUser = await knex("users").where({ email: actor_user_email }).first();
    if (actorUser) actor_user_id = actorUser.id;
  }

  return res.json({ data: {} });
});

hazardRouter.get("/:id/attachments", async (req: Request, res: Response) => {
  const { id } = req.params;

  const attachments = await knex("hazard_attachments").where({ hazard_id: id });

  return res.json({ data: attachments });
});

hazardRouter.post("/:id/attachments", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.files && req.files.files) {
    let files = req.files.files;

    if (!isArray(files)) files = [files];

    for (const file of files) {
      let attachment = {
        hazard_id: id,
        added_by_email: req.user.email,
        file_name: file.name,
        file_type: file.mimetype,
        file_size: file.size,
        file: file.data,
        added_date: InsertableDate(DateTime.utc().toISO()),
      };

      await knex("hazard_attachments").insert(attachment);
    }
  }

  return res.json({ data: "success" });
});
