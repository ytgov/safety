import express, { Request, Response } from "express";
import multer from "multer";

import { db } from "../data";
import { RequireAdmin } from "../middleware";
import { DataInjestionService, UserService } from "src/services";

export const dataInjestionRouter = express.Router();

const upload = multer({ dest: "uploads/" });

dataInjestionRouter.get("/", async (req: Request, res: Response) => {
  const list = await db("data_injestions").orderBy("source_id");
  return res.json({ data: list, totalCount: list.length });
});

dataInjestionRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await db("data_injestions").where({ id }).first();
  if (!data) return res.status(404).send();
  return res.json({ data });
});

dataInjestionRouter.delete("/:id", RequireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;

  await db("data_injestions").where({ id }).delete();
});

dataInjestionRouter.post("/", async (req: Request, res: Response) => {
  const svc = new DataInjestionService();
  const users = new UserService();
  const { source_id, user_id } = req.body;

  if (!req.files?.csvFile) return res.status(400).json({ error: "Missing file" });
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });
  if (!source_id) return res.status(400).json({ error: "Missing source_id" });

  if (!users.getById(Number(user_id))) {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  const uploaded = Array.isArray(req.files.csvFile) ? req.files.csvFile[0] : req.files.csvFile;

  try {
    await svc.insertCsvFromFilePath(uploaded.data, Number(source_id), Number(user_id));
    return res.json({ success: true });
  } catch (err: any) {
    console.error(" DataInjestionService Error:", err);
    return res.status(500).json({ error: err.message });
  }
});
