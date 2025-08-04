import express, { Request, Response } from "express";
import { db as knex } from "../data/db-client";
import { RequireAdmin } from "../middleware";

export const committeeRouter = express.Router();

committeeRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("committees").orderBy("name", "asc");
  const users = await knex("committee_users");

  for (const item of list) {
    item.users = users.filter((user) => user.committee_id === item.id).map((user) => user.user_id);
  }

  return res.json({ data: list });
});

committeeRouter.get("/:id", RequireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await knex("committees").where({ id }).first();
  if (!item) return res.status(404).json({ error: "Committee not found" });

  item.users = await knex("committee_users")
    .where({ committee_id: id })
    .innerJoin("users", "committee_users.user_id", "users.id")
    .select("committee_users.*", "users.display_name", "users.email");
  return res.json({ data: item });
});

committeeRouter.post("/", RequireAdmin, async (req: Request, res: Response) => {
  const item = await knex("committees").insert(req.body).returning("*");
  return res.json({ data: item[0] });
});

committeeRouter.put("/:id", RequireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { department_code, name, users } = req.body;

  await knex("committees").where({ id }).update({ name, department_code });
  await knex("committee_users").where({ committee_id: id }).delete();

  for (const user of users) {
    const { user_id } = user;
    await knex("committee_users").insert({ committee_id: id, user_id });
  }

  return res.json({ data: "success" });
});

committeeRouter.delete("/:id", RequireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  await knex("committee_users").where({ committee_id: id }).delete();
  await knex("committees").where({ id }).delete();
  return res.json({ data: "success" });
});
