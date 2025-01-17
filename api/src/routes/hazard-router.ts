import express, { Request, Response } from "express";
import { db as knex } from "../data";

export const hazardRouter = express.Router();

hazardRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("hazards");

  const locations = await knex("locations");
  const types = await knex("hazard_types");

  list.forEach((hazard: any) => {
    hazard.location = locations.find((l: any) => l.code === hazard.location_code);
    hazard.type = types.find((t: any) => t.id === hazard.hazard_type_id);
  });

  return res.json({ data: list });
});
