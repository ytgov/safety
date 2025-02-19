import express, { Request, Response } from "express";

import { db as knex } from "../data";
import { RequireAdmin } from "../middleware";
import { checkJwt, loadUser } from "../middleware/authz.middleware";

export const locationRouter = express.Router();

locationRouter.get("/", async (_req: Request, res: Response) => {
  const list = await knex("locations").orderBy("name", "asc");
  res.json({ data: list });
});

locationRouter.post("/", checkJwt, loadUser, RequireAdmin, async (req: Request, res: Response) => {
  const { code, name, description } = req.body;

  try {
    const list = await knex("locations").insert({ code, name, description });

    res.json({ data: list });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

locationRouter.put("/:code", async (req: Request, res: Response) => {
  const { code } = req.params;
  const { name, description } = req.body;

  try {
    const list = await knex("locations").where({ code }).update({ name, description });
    res.json({ data: list });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
