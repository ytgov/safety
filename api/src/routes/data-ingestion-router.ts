import express, { Request, Response } from "express";

import { db } from "@/data/db-client";
import { RequireAdmin } from "../middleware";
import {
  CreateService as DataIngestionCreateService,
  DataIngestionSourceService,
  UserService,
} from "@/services";
import { isNil } from "lodash";

export const dataIngestionRouter = express.Router();

dataIngestionRouter.get("/", async (req: Request, res: Response) => {
  const list = await db("data_ingestions").orderBy("source_id");
  return res.json({ dataIngestions: list, totalCount: list.length });
});

dataIngestionRouter.post("/", async (req: Request, res: Response) => {
  const { source_id, user_id } = req.body;
  const uploaded = Array.isArray(req.files?.csvFile) ? req.files!.csvFile[0] : req.files?.csvFile;
  if (isNil(uploaded)) {
    return res.status(422).json({ error: "No file uploaded" });
  }

  try {
    await DataIngestionCreateService.perform(uploaded.data, Number(source_id), Number(user_id));
    return res.json({ success: true });
  } catch (err: any) {
    console.error(" DataIngestionService Error:", err);
    return res.status(422).json({ 
      message: `Assessment deletion failed: ${err}` });
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
