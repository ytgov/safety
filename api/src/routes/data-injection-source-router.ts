import express, { Request, Response } from "express";
import { db as knex } from "../data";

export const dataInjectionSourceRouter = express.Router();

dataInjectionSourceRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("data_injection_sources");
  return res.json({ data: list });
});
