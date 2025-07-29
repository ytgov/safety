import express, { Request, Response } from "express";

import { db } from "../data";
import { RequireAdmin } from "../middleware";
import { DataInjectionService } from "src/services";

export const dataInjectionRouter = express.Router();

dataInjectionRouter.get("/", async (req: Request, res: Response) => {
  const list = await db("data_injections").orderBy("source_id");
  return res.json({ data: list, totalCount: list.length });
});

dataInjectionRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await db("data_injections").where({ id }).first();
  if (!data) return res.status(404).send();
  return res.json({ data });
});

dataInjectionRouter.delete("/:id", RequireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;

  await db("data_injections").where({ id }).delete();
});

dataInjectionRouter.post("/", async (req: Request, res: Response) => {
  const dataInjecionDb = new DataInjectionService();
  let { user_id, sourceId, csvFile } = req.body;
  if (!user_id) {
    return res
      .status(400)
      .json({ error: "Missing required parameter: user_id" });
  }

  if (!sourceId) {
    return res
      .status(400)
      .json({ error: "Missing required parameter: sourceId" });
  }

  if (!csvFile) {
    return res
      .status(400)
      .json({ error: "Missing required parameter: csvFile" });
  }

  try {
    await dataInjecionDb.insertCsvFromFilePath(csvFile.path, sourceId, user_id);
    res.json({ success: true });
  } catch (err) {
    throw new Error("Invalid Data");
  }  

});
