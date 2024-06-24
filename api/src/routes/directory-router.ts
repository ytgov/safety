import express, { Request, Response } from "express";
import { DirectoryService } from "../services";

export const directoryRouter = express.Router();

const directoryService = new DirectoryService();

directoryRouter.post("/search-directory", async (req: Request, res: Response) => {
  let { terms } = req.body;

  await directoryService.connect();
  let results = await directoryService.search(terms);

  return res.json({ data: [...results] });
});
