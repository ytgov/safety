import express, { Request, Response } from "express";
import { isArray } from "lodash";

import { db as knex } from "../data/db-client";
import { InsertableDate } from "../utils/formatters";

export const committeeMeetingRouter = express.Router();

function isSystemAdmin(req: any): boolean {
  const roles = req.user?.roles ?? [];
  return roles.some((r: any) => r.name === "System Admin");
}

async function isCochair(meetingId: number | string, req: any): Promise<boolean> {
  const email = req.user?.email?.toLowerCase();
  const userId = req.user?.id;
  if (!email && !userId) return false;
  const row = await knex("committee_meeting_cochairs")
    .where({ committee_meeting_id: meetingId })
    .where(function () {
      if (userId) this.orWhere({ user_id: userId });
      if (email) this.orWhereRaw(`LOWER("email") = ?`, [email]);
    })
    .first();
  return !!row;
}

committeeMeetingRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("committee_meetings")
    .leftJoin("committees", "committee_meetings.committee_id", "committees.id")
    .orderBy("meeting_date", "desc")
    .select("committee_meetings.*", "committees.name as committee_name");

  const cochairs = await knex("committee_meeting_cochairs");
  for (const m of list) {
    m.cochairs = cochairs.filter((c) => c.committee_meeting_id === m.id);
    m.has_minutes_file = !!m.minutes_file;
    delete m.minutes_file;
  }

  return res.json({ data: list });
});

committeeMeetingRouter.get("/previous-cochairs/:committee_id", async (req: Request, res: Response) => {
  const { committee_id } = req.params;

  const meetings = await knex("committee_meetings")
    .where({ committee_id })
    .orderBy("meeting_date", "desc")
    .orderBy("id", "desc")
    .limit(10)
    .select("id");

  if (meetings.length === 0) return res.json({ data: [] });

  const meetingIds = meetings.map((m) => m.id);
  const cochairs = await knex("committee_meeting_cochairs").whereIn("committee_meeting_id", meetingIds);

  const orderById = new Map(meetingIds.map((id, idx) => [id, idx]));
  cochairs.sort((a, b) => (orderById.get(a.committee_meeting_id) ?? 0) - (orderById.get(b.committee_meeting_id) ?? 0));

  const seen = new Set<string>();
  const unique: any[] = [];
  for (const c of cochairs) {
    const key = (c.email ?? "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push({ user_id: c.user_id, email: c.email, display_name: c.display_name });
  }

  return res.json({ data: unique });
});

committeeMeetingRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await knex("committee_meetings")
    .leftJoin("committees", "committee_meetings.committee_id", "committees.id")
    .where("committee_meetings.id", id)
    .select("committee_meetings.*", "committees.name as committee_name")
    .first();
  if (!item) return res.status(404).json({ error: "Meeting not found" });

  item.cochairs = await knex("committee_meeting_cochairs").where({ committee_meeting_id: id });
  item.has_minutes_file = !!item.minutes_file;
  delete item.minutes_file;

  return res.json({ data: item });
});

committeeMeetingRouter.get("/:id/minutes-file", async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await knex("committee_meetings").where({ id }).first();
  if (!item || !item.minutes_file) return res.status(404).send();

  res.setHeader("Content-disposition", `attachment; filename="${item.minutes_file_name}"`);
  res.setHeader("Content-type", item.minutes_file_type ?? "application/octet-stream");
  res.send(item.minutes_file);
});

committeeMeetingRouter.post("/", async (req: any, res: Response) => {
  const { committee_id, meeting_date, cochairs } = req.body;

  const inserted = await knex("committee_meetings")
    .insert({
      committee_id,
      meeting_date: InsertableDate(meeting_date),
      created_by_user_id: req.user?.id ?? null,
    })
    .returning("*");

  const meeting = inserted[0];

  if (isArray(cochairs)) {
    for (const c of cochairs) {
      let user_id = c.user_id ?? null;
      if (!user_id && c.email) {
        const match = await knex("users").whereRaw(`LOWER("email") = ?`, [c.email.toLowerCase()]).first();
        if (match) user_id = match.id;
      }
      await knex("committee_meeting_cochairs").insert({
        committee_meeting_id: meeting.id,
        committee_id,
        user_id,
        email: c.email ?? null,
        display_name: c.display_name ?? null,
      });
    }
  }

  return res.json({ data: meeting });
});

committeeMeetingRouter.put("/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  const { meeting_date, minutes, cochairs } = req.body;

  const existing = await knex("committee_meetings").where({ id }).first();
  if (!existing) return res.status(404).json({ error: "Meeting not found" });
  if (existing.status === "Complete") {
    return res.status(409).json({ error: "Meeting is complete and cannot be edited" });
  }

  const update: any = {};
  if (meeting_date !== undefined) update.meeting_date = InsertableDate(meeting_date);
  if (minutes !== undefined) update.minutes = minutes;

  if (Object.keys(update).length > 0) {
    await knex("committee_meetings").where({ id }).update(update);
  }

  if (isArray(cochairs)) {
    const meeting = await knex("committee_meetings").where({ id }).first();
    if (meeting) {
      await knex("committee_meeting_cochairs").where({ committee_meeting_id: id }).delete();
      for (const c of cochairs) {
        let user_id = c.user_id ?? null;
        if (!user_id && c.email) {
          const match = await knex("users").whereRaw(`LOWER("email") = ?`, [c.email.toLowerCase()]).first();
          if (match) user_id = match.id;
        }
        await knex("committee_meeting_cochairs").insert({
          committee_meeting_id: id,
          committee_id: meeting.committee_id,
          user_id,
          email: c.email ?? null,
          display_name: c.display_name ?? null,
        });
      }
    }
  }

  return res.json({ data: "success" });
});

committeeMeetingRouter.post("/:id/status", async (req: any, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== "Complete" && status !== "Draft") {
    return res.status(400).json({ error: "Invalid status" });
  }

  const meeting = await knex("committee_meetings").where({ id }).first();
  if (!meeting) return res.status(404).json({ error: "Meeting not found" });

  const admin = isSystemAdmin(req);
  const cochair = await isCochair(id, req);
  if (!admin && !cochair) {
    return res.status(403).json({ error: "Only a co-chair or System Admin can change meeting status" });
  }
  if (status === "Draft" && !admin) {
    return res.status(403).json({ error: "Only a System Admin can reopen a completed meeting" });
  }

  const update: any = { status };
  if (status === "Complete") {
    update.completed_at = knex.fn.now();
    update.completed_by_user_id = req.user?.id ?? null;
  } else {
    update.completed_at = null;
    update.completed_by_user_id = null;
  }

  await knex("committee_meetings").where({ id }).update(update);
  return res.json({ data: "success" });
});

committeeMeetingRouter.post("/:id/minutes-file", async (req: any, res: Response) => {
  const { id } = req.params;

  const existing = await knex("committee_meetings").where({ id }).first();
  if (!existing) return res.status(404).json({ error: "Meeting not found" });
  if (existing.status === "Complete") {
    return res.status(409).json({ error: "Meeting is complete and cannot be edited" });
  }

  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = isArray(req.files.file) ? req.files.file[0] : req.files.file;

  await knex("committee_meetings").where({ id }).update({
    minutes_file_name: file.name,
    minutes_file_type: file.mimetype,
    minutes_file_size: file.size,
    minutes_file: file.data,
  });

  return res.json({ data: "success" });
});

committeeMeetingRouter.delete("/:id/minutes-file", async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await knex("committee_meetings").where({ id }).first();
  if (!existing) return res.status(404).json({ error: "Meeting not found" });
  if (existing.status === "Complete") {
    return res.status(409).json({ error: "Meeting is complete and cannot be edited" });
  }
  await knex("committee_meetings").where({ id }).update({
    minutes_file_name: null,
    minutes_file_type: null,
    minutes_file_size: null,
    minutes_file: null,
  });
  return res.json({ data: "success" });
});

committeeMeetingRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await knex("committee_meeting_cochairs").where({ committee_meeting_id: id }).delete();
  await knex("committee_meetings").where({ id }).delete();
  return res.json({ data: "success" });
});
