import express, { Request, Response } from "express";
import { db as knex } from "../data";

export const dataInjestionSourceRouter = express.Router();

dataInjestionSourceRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("data_injestion_sources");
  return res.json({ data: list });
});
