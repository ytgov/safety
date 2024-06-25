import express, { Request, Response } from "express";

import { db as knex } from "../data";

export const locationRouter = express.Router();

locationRouter.get("/", async (_req: Request, res: Response) => {
  const list = await knex("locations");
  res.json({ data: list });
});
