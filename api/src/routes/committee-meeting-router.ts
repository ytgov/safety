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
  const members = await knex("committee_meeting_members");
  const files = await knex("committee_meeting_files").select(
    "id",
    "committee_meeting_id",
    "added_date",
    "added_by_email",
    "file_name",
    "file_type",
    "file_size"
  );
  for (const m of list) {
    m.cochairs = cochairs.filter((c) => c.committee_meeting_id === m.id);
    m.members = members.filter((mem) => mem.committee_meeting_id === m.id);
    m.files = files.filter((f) => f.committee_meeting_id === m.id);
  }

  return res.json({ data: list });
});

committeeMeetingRouter.get("/previous-attendees/:committee_id", async (req: Request, res: Response) => {
  const { committee_id } = req.params;

  const previous = await knex("committee_meetings")
    .where({ committee_id })
    .orderBy("meeting_date", "desc")
    .orderBy("id", "desc")
    .first();

  if (!previous) return res.json({ data: { cochairs: [], members: [] } });

  const dedupe = (rows: any[]) => {
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const r of rows) {
      const key = (r.email ?? "").toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push({ user_id: r.user_id, email: r.email, display_name: r.display_name });
    }
    return unique;
  };

  const cochairs = await knex("committee_meeting_cochairs").where({ committee_meeting_id: previous.id });
  const members = await knex("committee_meeting_members").where({ committee_meeting_id: previous.id });

  return res.json({ data: { cochairs: dedupe(cochairs), members: dedupe(members) } });
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
  item.members = await knex("committee_meeting_members").where({ committee_meeting_id: id });
  item.files = await knex("committee_meeting_files")
    .where({ committee_meeting_id: id })
    .select("id", "committee_meeting_id", "added_date", "added_by_email", "file_name", "file_type", "file_size");

  return res.json({ data: item });
});

committeeMeetingRouter.get("/:id/files/:fileId", async (req: Request, res: Response) => {
  const { id, fileId } = req.params;
  const file = await knex("committee_meeting_files")
    .where({ committee_meeting_id: id, id: fileId })
    .first();
  if (!file || !file.file) return res.status(404).send();

  res.setHeader("Content-disposition", `attachment; filename="${file.file_name}"`);
  res.setHeader("Content-type", file.file_type ?? "application/octet-stream");
  res.send(file.file);
});

committeeMeetingRouter.post("/", async (req: any, res: Response) => {
  const { committee_id, meeting_date, cochairs, members } = req.body;

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

  if (isArray(members)) {
    for (const m of members) {
      let user_id = m.user_id ?? null;
      if (!user_id && m.email) {
        const match = await knex("users").whereRaw(`LOWER("email") = ?`, [m.email.toLowerCase()]).first();
        if (match) user_id = match.id;
      }
      await knex("committee_meeting_members").insert({
        committee_meeting_id: meeting.id,
        committee_id,
        user_id,
        email: m.email ?? null,
        display_name: m.display_name ?? null,
      });
    }
  }

  return res.json({ data: meeting });
});

committeeMeetingRouter.put("/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  const { meeting_date, minutes, cochairs, members } = req.body;

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

  if (isArray(members)) {
    const meeting = await knex("committee_meetings").where({ id }).first();
    if (meeting) {
      await knex("committee_meeting_members").where({ committee_meeting_id: id }).delete();
      for (const m of members) {
        let user_id = m.user_id ?? null;
        if (!user_id && m.email) {
          const match = await knex("users").whereRaw(`LOWER("email") = ?`, [m.email.toLowerCase()]).first();
          if (match) user_id = match.id;
        }
        await knex("committee_meeting_members").insert({
          committee_meeting_id: id,
          committee_id: meeting.committee_id,
          user_id,
          email: m.email ?? null,
          display_name: m.display_name ?? null,
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

committeeMeetingRouter.post("/:id/files", async (req: any, res: Response) => {
  const { id } = req.params;

  const existing = await knex("committee_meetings").where({ id }).first();
  if (!existing) return res.status(404).json({ error: "Meeting not found" });
  if (existing.status === "Complete") {
    return res.status(409).json({ error: "Meeting is complete and cannot be edited" });
  }

  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const uploaded = isArray(req.files.file) ? req.files.file : [req.files.file];

  for (const file of uploaded) {
    await knex("committee_meeting_files").insert({
      committee_meeting_id: id,
      added_by_email: req.user?.email ?? null,
      added_by_user_id: req.user?.id ?? null,
      file_name: file.name,
      file_type: file.mimetype,
      file_size: file.size,
      file: file.data,
    });
  }

  return res.json({ data: "success" });
});

committeeMeetingRouter.delete("/:id/files/:fileId", async (req: Request, res: Response) => {
  const { id, fileId } = req.params;
  const existing = await knex("committee_meetings").where({ id }).first();
  if (!existing) return res.status(404).json({ error: "Meeting not found" });
  if (existing.status === "Complete") {
    return res.status(409).json({ error: "Meeting is complete and cannot be edited" });
  }
  await knex("committee_meeting_files").where({ committee_meeting_id: id, id: fileId }).delete();
  return res.json({ data: "success" });
});

committeeMeetingRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await knex("committee_meeting_cochairs").where({ committee_meeting_id: id }).delete();
  await knex("committee_meeting_members").where({ committee_meeting_id: id }).delete();
  await knex("committee_meeting_files").where({ committee_meeting_id: id }).delete();
  await knex("committee_meetings").where({ id }).delete();
  return res.json({ data: "success" });
});
