import express, { Request, Response } from "express";

import { IncidentAttachment } from "../data/models";
import { db as knex } from "../data";

export const attachmentRouter = express.Router();

attachmentRouter.get("/incident/:incident_id/attachment/:id", async (req: Request, res: Response) => {
  const { incident_id, id } = req.params;
  let attach = await knex("incident_attachments").where({ incident_id, id }).first<IncidentAttachment>();

  if (!attach) {
    return res.status(404).send();
  }

  res.setHeader("Content-disposition", `attachment; filename="${attach.file_name}"`);
  res.setHeader("Content-type", attach.file_type ?? "");
  res.send(attach.file);
});

attachmentRouter.get("/hazard/:hazard_id/attachment/:id", async (req: Request, res: Response) => {
  const { hazard_id, id } = req.params;
  let attach = await knex("hazard_attachments").where({ hazard_id, id }).first<IncidentAttachment>();

  if (!attach) {
    return res.status(404).send();
  }

  res.setHeader("Content-disposition", `attachment; filename="${attach.file_name}"`);
  res.setHeader("Content-type", attach.file_type ?? "");
  res.send(attach.file);
});
