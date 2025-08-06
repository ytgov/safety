import express, { Request, Response } from "express";
import { db as knex } from "../data/db-client";

export const departmentRouter = express.Router();

departmentRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("departments").orderBy("name", "asc");
  return res.json({ data: list });
});
