import express, { Request, Response } from "express";

import { db as knex } from "../data";

export const dataIngestionSourceRouter = express.Router();

dataIngestionSourceRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("data_ingestion_sources");
  return res.json({ data: list });
});
