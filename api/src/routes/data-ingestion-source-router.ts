import express, { Request, Response } from "express";

import { DataIngestionSourceService } from "src/services";

export const dataIngestionSourceRouter = express.Router();
const db = new DataIngestionSourceService();

dataIngestionSourceRouter.get("/", async (req: Request, res: Response) => {
  const list = await db.getAll();

  return res.json({ dataIngestionSources: list });
});
