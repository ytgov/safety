import express, { Request, Response } from "express";
import { param } from "express-validator";

import { db as knex } from "../data";
import { ReturnValidationErrors } from "../middleware";
import { Action, ActionStatuses, ActionTypes, SensitivityLevels } from "../data/models";
import { InsertableDate } from "../utils/formatters";
import { DateTime } from "luxon";

export const actionRouter = express.Router();
actionRouter.get("/me", async (req: Request, res: Response) => {
  return res.json({ data: req.user });
});

actionRouter.get("/:incident_id", async (req: Request, res: Response) => {
  const { incident_id } = req.params;

  const list = await knex<Action>("actions")
    .where({ incident_id: parseInt(incident_id) })
    .orderBy("due_date");

  for (let item of list) {
  }

  return res.json({ data: list });
});

actionRouter.post("/:incident_id", async (req: Request, res: Response) => {
  const { incident_id } = req.params;
  const { description, actor_user_email, actor_user_id } = req.body;

  const action = {
    incident_id: parseInt(incident_id),
    created_at: InsertableDate(DateTime.utc().toISO()),
    description,
    action_type_code: ActionTypes.USER_GENERATED.code,
    sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
    status_code: ActionStatuses.OPEN.code,
    actor_user_email,
    actor_user_id,
  } as Action;

  await knex("actions")
    .insert(action)
    .catch((e) => {
      console.log("ERROR CREATE");
      res.json({ data: { error: [{ text: e, variant: "error" }] } });
    });

  return res.json({});
});

actionRouter.put(
  "/:id",
  [param("id").notEmpty().isInt()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { description, actor_user_email, actor_user_id, status_code, due_date } = req.body;

    await knex("actions").where({ id }).update({ description, actor_user_email, actor_user_id, status_code, due_date });

    res.json({}).send();
  }
);
