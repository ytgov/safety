import express, { Request, Response } from "express";

import { db } from "../data/db-client";
import { db as knex } from "../data/db-client";
import { RequireAdmin } from "../middleware";

export const inspectionLocationRouter = express.Router();

inspectionLocationRouter.get("/", async (req: Request, res: Response) => {
  const list = await db("inspection_locations").orderBy("name");
  return res.json({ data: list, totalCount: list.length });
});

inspectionLocationRouter.get("/branches/:department_code", async (req: Request, res: Response) => {
  const { department_code } = req.params;
  const rows = await db("inspection_locations")
    .distinct("branch")
    .where({ department_code })
    .whereNotNull("branch")
    .orderBy("branch");
  const branches = rows.map((r: any) => r.branch);
  return res.json({ data: branches });
});

inspectionLocationRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await db("inspection_locations").where({ id }).first();
  if (!data) return res.status(404).send();
  return res.json({ data });
});

inspectionLocationRouter.put("/:id", RequireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, department_code, building_id, location_code, branch } = req.body;

  const data = await db("inspection_locations").where({ id }).first();
  if (!data) return res.status(404).send();

  await knex("inspection_locations").where({ id }).update({ name, description, department_code, building_id, location_code, branch });

  return res.json({ data: {}, messages: [{ variant: "success", text: "Saved" }] });
});

inspectionLocationRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  res.send("Not implemented yet");
});

inspectionLocationRouter.post("/", async (req: Request, res: Response) => {
  let { name, description, department_code, building_id, location_code, branch } = req.body;

  await knex("inspection_locations").insert({ name, description, department_code, building_id, location_code, branch });

  return res.json({ data: {} });
});
