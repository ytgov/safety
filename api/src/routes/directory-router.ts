import express, { Request, Response } from "express";
import { DirectoryService } from "../services";
import { db as knex } from "../data";

export const directoryRouter = express.Router();

const directoryService = new DirectoryService();

directoryRouter.post("/search-directory", async (req: Request, res: Response) => {
  let { terms } = req.body;

  await directoryService.connect();
  let results = await directoryService.search(terms);

  return res.json({ data: [...results] });
});

directoryRouter.post("/search-action-directory", async (req: Request, res: Response) => {
  let { terms } = req.body;

  await directoryService.connect();
  let data = await directoryService.search(terms);

  const allUsers = await knex("users");

  data.map((d: any) => (d.user_id = allUsers.find((u) => u.email == d.email)?.id));

  return res.json({ data });
});
