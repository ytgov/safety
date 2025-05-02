import express, { Request, Response } from "express";
import { db as knex } from "../data";

export const committeeRouter = express.Router();

committeeRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("committees").orderBy("name", "asc");
  const users = await knex("committee_users");

  for (const item of list) {
    item.users = users.filter((user) => user.committee_id === item.id).map((user) => user.user_id);
  }

  return res.json({ data: list });
});
