import express, { Request, Response } from "express";

import { db } from "../data";
import { RequireAdmin } from "../middleware";
import { DataIngestionService, DataIngestionSourceService, UserService } from "src/services";
import { isNil } from "lodash";

export const dataIngestionRouter = express.Router();

dataIngestionRouter.get("/", async (req: Request, res: Response) => {
  const list = await db("data_ingestions").orderBy("source_id");
  return res.json({ dataIngestions: list, totalCount: list.length });
});

dataIngestionRouter.post("/", async (req: Request, res: Response) => {
  const dataIngestionService = new DataIngestionService();
  const users = new UserService();
  const dataIngestionSource= new DataIngestionSourceService();
  const { source_id, user_id } = req.body;

  if (isNil(req.files?.csvFile)) return res.status(400).json({ error: "Missing file" });
  if (isNil(user_id)) return res.status(422).json({ error: "Missing user_id" });
  if (isNil(source_id)) return res.status(422).json({ error: "Missing source_id" });

  if (isNil(users.getById(Number(user_id)))) {
    return res.status(422).json({ error: "Invalid user_id" });
  }

  if (isNil(dataIngestionSource.getById(Number(source_id)))) {
    return res.status(422).json({ error: "Invalid source_id" });
  }

  const uploaded = Array.isArray(req.files.csvFile) ? req.files.csvFile[0] : req.files.csvFile;

  try {
    await dataIngestionService.insertCsvFromFilePath(
      uploaded.data,
      Number(source_id),
      Number(user_id)
    );
    return res.json({ success: true });
  } catch (err: any) {
    console.error(" DataIngestionService Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

dataIngestionRouter.get("/:dataIngestionId", async (req: Request, res: Response) => {
  const { id } = req.params;
  const dataIngestion = await db("data_ingestions").where({ id }).first();
  if (!dataIngestion) return res.status(404).send();
  return res.json({ dataIngestion });
});

dataIngestionRouter.delete(
  "/:dataIngestionId",
  RequireAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await db("data_ingestions").where({ id }).delete();
  }
);
