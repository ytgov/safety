import express, { Request, Response } from "express";
import { isArray } from "lodash";

import { db as knex } from "../data/db-client";
import { InsertableDate } from "../utils/formatters";
import { assessmentLabel, buildMinutesPdf } from "../services/committee-meeting-pdf-service";

export const committeeMeetingRouter = express.Router();

// minutes_data is stored as a JSON string (mirrors investigations.investigation_data).
// Parse it back into an object for callers; null/invalid becomes null.
function parseMinutesData<T extends { minutes_data?: any }>(row: T): T {
  if (row && typeof row.minutes_data === "string") {
    try {
      row.minutes_data = JSON.parse(row.minutes_data);
    } catch {
      row.minutes_data = null;
    }
  }
  return row;
}

function trimmed(value: any): string {
  return value === null || value === undefined ? "" : `${value}`.trim();
}

// meeting_date is a date-only value. Trim any time/zone a caller sends so it can
// never influence which day gets stored or which meetings a range comparison picks up.
function dateOnly(value: any): string | null {
  const s = trimmed(value);
  return s ? s.slice(0, 10) : null;
}

// Oracle's DATE type is fetched as a JS Date, which res.json() then stamps to UTC --
// shifting the day for any client whose timezone differs from the API's. Selecting the
// column as text means no timezone is ever applied to it. TO_CHAR is valid on both
// Oracle and Postgres. Aliased rather than overriding meeting_date directly so it can
// sit alongside a `committee_meetings.*` select without duplicating the column.
function meetingDateText() {
  return knex.raw(`TO_CHAR("committee_meetings"."meeting_date", 'YYYY-MM-DD') as "meeting_date_text"`);
}

function normalizeMeetingDate<T extends { meeting_date?: any; meeting_date_text?: any }>(row: T): T {
  if (row && row.meeting_date_text !== undefined) {
    row.meeting_date = row.meeting_date_text;
    delete row.meeting_date_text;
  }
  return row;
}

// Rows the committee ticked "Flag for discussion in the next meeting" on, reshaped as
// outstanding discussion items so the next meeting's minutes pick them up. Discussion
// items keep their own target date; assessments and refusals start without one because
// the committee sets a fresh target when it revisits them. Outstanding items come first
// so a repeatedly deferred item keeps its place at the top of the list.
function carryForwardItems(data: any): any[] {
  if (!data || typeof data !== "object") return [];

  const flagged = (rows: any): any[] => (isArray(rows) ? rows.filter((r) => r && r.flag_next) : []);
  const items: any[] = [];
  // Carried rows arrive unflagged — the committee re-ticks anything it defers again.
  const push = (concern: string, action: string, target_date: any = null) =>
    items.push({ concern, action, target_date, flag_next: false });

  for (const r of [...flagged(data.outstanding_items), ...flagged(data.new_items)]) {
    push(trimmed(r.concern), trimmed(r.action), r.target_date ?? null);
  }

  for (const r of flagged(data.assessments)) {
    const label = assessmentLabel(r);
    push(label ? `Hazard assessment: ${label}` : "Hazard assessment", "");
  }

  for (const r of flagged(data.refusals)) {
    const detail = [trimmed(r.location), trimmed(r.reason)].filter(Boolean).join(" — ");
    push(detail ? `Work refusal: ${detail}` : "Work refusal", trimmed(r.outcome));
  }

  return items;
}

function isSystemAdmin(req: any): boolean {
  const roles = req.user?.roles ?? [];
  return roles.some((r: any) => r.name === "System Admin");
}

const YES_NO_FIELDS = ["quorum", "meet_anyway", "worker_vacancies"] as const;
const COUNT_FIELDS = [
  "no_loss_incidents_reviewed",
  "loss_incidents_reviewed",
  "new_hazards_reviewed",
  "worker_vacancy_count",
] as const;

function cleanYesNo(value: any): string | null {
  return value === "Yes" || value === "No" ? value : null;
}

function cleanCount(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

// Pulls the quorum/review answers off a request body. Only keys the caller actually
// sent are returned, so a PUT that omits them leaves the stored answers alone.
function reviewAnswersFrom(body: any): Record<string, any> {
  const answers: Record<string, any> = {};
  for (const field of YES_NO_FIELDS) {
    if (body[field] !== undefined) answers[field] = cleanYesNo(body[field]);
  }
  for (const field of COUNT_FIELDS) {
    if (body[field] !== undefined) answers[field] = cleanCount(body[field]);
  }
  return answers;
}

// The two follow-up answers only exist when their parent answer opens them up.
// Applied against the merged (existing + incoming) row so a PUT that changes only
// the parent still clears a now-orphaned follow-up.
function clearOrphanedFollowUps(merged: Record<string, any>): Record<string, any> {
  if (merged.quorum !== "No") merged.meet_anyway = null;
  if (merged.worker_vacancies !== "Yes") merged.worker_vacancy_count = null;
  return merged;
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
    .select("committee_meetings.*", "committees.name as committee_name", meetingDateText());

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
    normalizeMeetingDate(m);
    m.cochairs = cochairs.filter((c) => c.committee_meeting_id === m.id);
    m.members = members.filter((mem) => mem.committee_meeting_id === m.id);
    m.files = files.filter((f) => f.committee_meeting_id === m.id);
  }

  return res.json({ data: list });
});

committeeMeetingRouter.get("/previous-attendees/:committee_id", async (req: Request, res: Response) => {
  const { committee_id } = req.params;
  const before = req.query.before ? InsertableDate(dateOnly(req.query.before)) : null;

  const previous = await knex("committee_meetings")
    .where({ committee_id })
    .where((q) => {
      if (before) q.where("meeting_date", "<", before);
    })
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

// Items flagged at the committee's most recent earlier meeting, ready to seed the
// Outstanding Items list of the meeting being set up.
committeeMeetingRouter.get("/carry-forward/:committee_id", async (req: Request, res: Response) => {
  const { committee_id } = req.params;
  const before = req.query.before ? InsertableDate(dateOnly(req.query.before)) : null;

  const previous = await knex("committee_meetings")
    .where({ committee_id })
    .where((q) => {
      if (before) q.where("meeting_date", "<", before);
    })
    .orderBy("meeting_date", "desc")
    .orderBy("id", "desc")
    .first();

  if (!previous) return res.json({ data: [] });

  return res.json({ data: carryForwardItems(parseMinutesData(previous).minutes_data) });
});

committeeMeetingRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await knex("committee_meetings")
    .leftJoin("committees", "committee_meetings.committee_id", "committees.id")
    .where("committee_meetings.id", id)
    .select("committee_meetings.*", "committees.name as committee_name", meetingDateText())
    .first();
  if (!item) return res.status(404).json({ error: "Meeting not found" });

  item.cochairs = await knex("committee_meeting_cochairs").where({ committee_meeting_id: id });
  item.members = await knex("committee_meeting_members").where({ committee_meeting_id: id });
  item.files = await knex("committee_meeting_files")
    .where({ committee_meeting_id: id })
    .select("id", "committee_meeting_id", "added_date", "added_by_email", "file_name", "file_type", "file_size");

  return res.json({ data: normalizeMeetingDate(parseMinutesData(item)) });
});

committeeMeetingRouter.get("/:id/minutes.pdf", async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await knex("committee_meetings")
    .leftJoin("committees", "committee_meetings.committee_id", "committees.id")
    .where("committee_meetings.id", id)
    .select("committee_meetings.*", "committees.name as committee_name", meetingDateText())
    .first();
  if (!item) return res.status(404).json({ error: "Meeting not found" });

  parseMinutesData(item);
  normalizeMeetingDate(item);
  item.cochairs = await knex("committee_meeting_cochairs").where({ committee_meeting_id: id });
  item.members = await knex("committee_meeting_members").where({ committee_meeting_id: id });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="meeting-minutes-${id}.pdf"`);
  buildMinutesPdf(item, res);
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
      meeting_date: InsertableDate(dateOnly(meeting_date)),
      created_by_user_id: req.user?.id ?? null,
      ...clearOrphanedFollowUps(reviewAnswersFrom(req.body)),
    })
    .returning("*");

  const meeting = inserted[0];
  // `returning("*")` hands back the driver's own rendering of the date column; echo the
  // date-only string the caller sent instead so responses stay consistent with the reads.
  meeting.meeting_date = dateOnly(meeting_date);

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
  const { meeting_date, minutes, minutes_data, cochairs, members } = req.body;

  const existing = await knex("committee_meetings").where({ id }).first();
  if (!existing) return res.status(404).json({ error: "Meeting not found" });
  if (existing.status === "Complete") {
    return res.status(409).json({ error: "Meeting is complete and cannot be edited" });
  }

  const update: any = {};
  if (meeting_date !== undefined) update.meeting_date = InsertableDate(dateOnly(meeting_date));
  if (minutes !== undefined) update.minutes = minutes;
  if (minutes_data !== undefined) {
    update.minutes_data = minutes_data === null ? null : JSON.stringify(minutes_data);
  }

  const answers = reviewAnswersFrom(req.body);
  if (Object.keys(answers).length > 0) {
    const merged = clearOrphanedFollowUps({ ...existing, ...answers });
    for (const field of [...YES_NO_FIELDS, ...COUNT_FIELDS]) {
      if (merged[field] !== existing[field]) update[field] = merged[field];
    }
  }

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
