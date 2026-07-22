import { DateTime } from "luxon";

// Canonical structure persisted to committee_meetings.minutes_data (JSON). This is
// the source of truth the API PDF and the on-page preview both render from.

function toCount(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function cleanDiscussion(rows) {
  return (rows || [])
    .map((r) => ({
      concern: (r.concern || "").trim(),
      action: (r.action || "").trim(),
      target_date: r.target_date || null,
    }))
    .filter((r) => r.concern || r.action || r.target_date);
}

function cleanHazards(rows) {
  return (rows || [])
    .map((r) => ({
      hazard: (r.hazard || "").trim(),
      controlled_at_source: toCount(r.controlled_at_source),
      recommended_to_management: toCount(r.recommended_to_management),
    }))
    .filter((r) => r.hazard || r.controlled_at_source !== null || r.recommended_to_management !== null);
}

function cleanRefusals(rows) {
  return (rows || [])
    .map((r) => ({
      location: (r.location || "").trim(),
      reason: (r.reason || "").trim(),
      outcome: (r.outcome || "").trim(),
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
    outstanding_items: guided ? cleanDiscussion(form.outstanding_items) : [],
    new_items: guided ? cleanDiscussion(form.new_items) : [],
    hazards: guided ? cleanHazards(form.hazards) : [],
    assessments: guided
      ? {
          in_progress: toCount(form.assessments?.in_progress),
          completed: toCount(form.assessments?.completed),
          hazards_identified: toCount(form.assessments?.hazards_identified),
          controls_implemented: toCount(form.assessments?.controls_implemented),
        }
      : null,
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

  const discussionGroup = (heading, items) => {
    push(heading);
    if (!items || items.length === 0) {
      push("  (none)");
    } else {
      for (const it of items) {
        push(`  • ${val(it.concern)}`);
        push(`      Action: ${val(it.action)}`);
        if (it.target_date) push(`      Target date: ${fmtDate(it.target_date)}`);
      }
    }
    push();
  };

  rule();
  push("DISCUSSION ITEMS");
  rule();
  discussionGroup("Outstanding Items from Previous Meetings", data.outstanding_items);
  discussionGroup("Open Discussion of New Items", data.new_items);

  rule();
  push("HAZARDS IDENTIFIED");
  rule();
  if (!data.hazards || data.hazards.length === 0) {
    push("  (none)");
  } else {
    for (const h of data.hazards) {
      push(`  • ${val(h.hazard)}`);
      push(`      Controlled at source: ${val(h.controlled_at_source)}  |  Recommended to management: ${val(h.recommended_to_management)}`);
    }
  }
  push();

  rule();
  push("HAZARD ASSESSMENTS");
  rule();
  const a = data.assessments || {};
  push(`  In progress: ${val(a.in_progress)}  |  Completed: ${val(a.completed)}`);
  push(`  Hazards identified: ${val(a.hazards_identified)}  |  Controls implemented: ${val(a.controls_implemented)}`);
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
    }
  }

  return lines.join("\n");
}
