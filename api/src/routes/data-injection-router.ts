import express, { Request, Response } from "express";
import multer from "multer";
import { db } from "../data";
import { RequireAdmin } from "../middleware";
import { DataInjectionService, UserService } from "src/services";

export const dataInjectionRouter = express.Router();

const upload = multer({ dest: "uploads/" });

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

dataInjectionRouter.post(
  "/",
  upload.single("csvFile"),
  async (req, res, next) => {
    const dataInjectionService = new DataInjectionService();
    const userService = new UserService();
    const { source_id, user_id } = req.body;
    if (!req.file) return res.status(400).json({ error: "Missing file" });
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });
    if (!source_id) return res.status(400).json({ error: "Missing sourceId" });

    if (userService.getById(user_id) === undefined) {
      return res.status(400).json({ error: "Invalid user_id" });
    }
    
    try {
      await dataInjectionService.insertCsvFromFilePath(
        req.file.path,    
        Number(source_id),
        Number(user_id)
      );
      res.json({ success: true });
    } catch (err) {
      throw new Error(`Data injection failed`);
    }
  }

);
