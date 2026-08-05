import { DateTime } from "luxon";

// Canonical structure persisted to committee_meetings.minutes_data (JSON). This is
// the source of truth the API PDF and the on-page preview both render from.

function toCount(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function cleanDiscussion(rows, flaggable = false) {
  return (rows || [])
    .map((r) => ({
      concern: (r.concern || "").trim(),
      action: (r.action || "").trim(),
      target_date: asDateString(r.target_date),
      ...(flaggable ? { flag_next: !!r.flag_next } : {}),
    }))
    .filter((r) => r.concern || r.action || r.target_date);
}

export const ASSESSMENT_OPTIONS = [
  "Formal Workplace Hazard Assessment",
  "Psychological Health & Safety Hazard Assessment",
  "Other",
];

// A row's display label is the picked option, except for "Other" where the
// committee names the assessment themselves.
export function assessmentLabel(row) {
  if (!row) return "";
  return row.assessment === "Other" ? (row.other_name || "").trim() || "Other" : row.assessment || "";
}

function cleanAssessments(rows) {
  return (rows || [])
    .map((r) => ({
      assessment: r.assessment || null,
      other_name: r.assessment === "Other" ? (r.other_name || "").trim() : "",
      date_completed: asDateString(r.date_completed),
      flag_next: !!r.flag_next,
    }))
    .filter((r) => r.assessment || r.date_completed);
}

// The date picker hands back a Date; keep the stored value a local calendar day
// rather than letting toISOString() shift it into the previous day.
function asDateString(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const month = `${value.getMonth() + 1}`.padStart(2, "0");
    const day = `${value.getDate()}`.padStart(2, "0");
    return `${value.getFullYear()}-${month}-${day}`;
  }
  return `${value}`.slice(0, 10);
}

function cleanRefusals(rows) {
  return (rows || [])
    .map((r) => ({
      location: (r.location || "").trim(),
      reason: (r.reason || "").trim(),
      outcome: (r.outcome || "").trim(),
      flag_next: !!r.flag_next,
    }))
    .filter((r) => r.location || r.reason || r.outcome);
}

export function buildMinutesData(form, mode) {
  const guided = mode === "guided";
  return {
    method: mode,
    quorum: form.quorum ?? null,
    meet_anyway: form.meet_anyway ?? null,
    no_loss_incidents_reviewed: toCount(form.no_loss_incidents_reviewed),
    loss_incidents_reviewed: toCount(form.loss_incidents_reviewed),
    new_hazards_reviewed: toCount(form.new_hazards_reviewed),
    worker_vacancies: form.worker_vacancies ?? null,
    worker_vacancy_count: toCount(form.worker_vacancy_count),
    outstanding_items: guided ? cleanDiscussion(form.outstanding_items, true) : [],
    new_items: guided ? cleanDiscussion(form.new_items, true) : [],
    assessments: guided ? cleanAssessments(form.assessments) : [],
    refusals: guided ? cleanRefusals(form.refusals) : [],
  };
}

function fmtDate(d) {
  if (!d) return "";
  const dt = DateTime.fromISO(d);
  return dt.isValid ? dt.toFormat("DD") : String(d);
}

function val(v) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

// Plain-text rendering for the editable minutes box. Mirrors the section order of
// the PDF / template so the two stay recognisably the same document.
export function renderMinutesText(data, meeting) {
  const lines = [];
  const push = (s = "") => lines.push(s);
  const rule = () => push("=".repeat(60));

  push(`${meeting?.committee_name ?? "Committee"} – Meeting Minutes`);
  push(fmtDate(meeting?.meeting_date));
  const cochairs = (meeting?.cochairs || []).map((c) => c.display_name || c.email).filter(Boolean).join(", ");
  if (cochairs) push(`Co-Chairs: ${cochairs}`);
  push();

  rule();
  push("QUORUM & REVIEW QUESTIONS");
  rule();
  push(`Met quorum: ${val(data.quorum)}`);
  if (data.quorum === "No") push(`Met anyway (informational): ${val(data.meet_anyway)}`);
  push(`No loss (near miss) incidents reviewed: ${val(data.no_loss_incidents_reviewed)}`);
  push(`Loss incidents reviewed: ${val(data.loss_incidents_reviewed)}`);
  push(`New hazards reviewed: ${val(data.new_hazards_reviewed)}`);
  push(`Worker member vacancies: ${val(data.worker_vacancies)}`);
  if (data.worker_vacancies === "Yes") push(`Number of vacancies: ${val(data.worker_vacancy_count)}`);
  push();

  if (data.method === "upload") {
    push("Minutes were attached as an uploaded document.");
    return lines.join("\n");
  }

  const flagLine = (row) => {
    if (row.flag_next) push("      Flagged for discussion in the next meeting");
  };

  const discussionGroup = (heading, items) => {
    if (heading) push(heading);
    if (!items || items.length === 0) {
      push("  (none)");
    } else {
      for (const it of items) {
        push(`  • ${val(it.concern)}`);
        push(`      Action: ${val(it.action)}`);
        if (it.target_date) push(`      Target date: ${fmtDate(it.target_date)}`);
        flagLine(it);
      }
    }
    push();
  };

  rule();
  push("OUTSTANDING ITEMS FROM PREVIOUS MEETINGS");
  rule();
  discussionGroup("", data.outstanding_items);

  rule();
  push("OPEN DISCUSSION OF NEW ITEMS");
  rule();
  discussionGroup("", data.new_items);

  rule();
  push("HAZARD ASSESSMENTS");
  rule();
  // Assessments used to be a single counts object; only the current list shape renders.
  const assessments = Array.isArray(data.assessments) ? data.assessments : [];
  if (assessments.length === 0) {
    push("  (none)");
  } else {
    for (const a of assessments) {
      push(`  • ${val(assessmentLabel(a))}`);
      push(`      Date completed: ${a.date_completed ? fmtDate(a.date_completed) : "—"}`);
      flagLine(a);
    }
  }
  push();

  rule();
  push("WORK REFUSALS");
  rule();
  if (!data.refusals || data.refusals.length === 0) {
    push("  (none)");
  } else {
    for (const r of data.refusals) {
      push(`  • ${val(r.location)}`);
      push(`      Reason: ${val(r.reason)}`);
      push(`      Outcome: ${val(r.outcome)}`);
      flagLine(r);
    }
  }

  return lines.join("\n");
}
