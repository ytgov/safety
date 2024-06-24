import express, { Request, Response } from "express";
import { db as knex } from "../data";

export const locationRouter = express.Router();

locationRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("locations");
  return res.json({ data: list });
});
