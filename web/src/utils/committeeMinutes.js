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

export const INSPECTION_RANGE_OPTIONS = [
  { title: "Last 30 Days", value: 30 },
  { title: "Last 60 Days", value: 60 },
  { title: "Last 90 Days", value: 90 },
];

export function inspectionRangeDays(value) {
  const n = Number(value);
  return INSPECTION_RANGE_OPTIONS.some((o) => o.value === n) ? n : 30;
}

// Inspections aren't authored in the wizard -- the rows shown at Finish are snapshotted
// so the minutes keep rendering the same list even as newer inspections are logged.
function cleanInspections(rows) {
  return (rows || []).map((r) => ({
    id: r.id ?? null,
    inspection_date: asDateString(r.inspection_date),
    inspection_location_branch: (r.inspection_location_branch || "").trim(),
    inspection_location_name: (r.inspection_location_name || "").trim(),
    location_name: (r.location_name || "").trim(),
    reporting_person_email: (r.reporting_person_email || "").trim(),
    status_name: (r.status_name || "").trim(),
  }));
}

// The list column falls back to the community when an inspection has no named
// inspection location attached.
export function inspectionPlace(row) {
  if (!row) return "";
  return (row.inspection_location_name || "").trim() || (row.location_name || "").trim();
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
    inspections: guided ? cleanInspections(form.inspections) : [],
    inspections_range_days: guided ? inspectionRangeDays(form.inspections_range_days) : null,
    inspections_location_id: guided ? form.inspections_location_id ?? null : null,
    inspections_location_name: guided ? (form.inspections_location_name || "").trim() : "",
    inspections_notes: guided ? (form.inspections_notes || "").trim() : "",
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
  const guests = (meeting?.guests || []).map((g) => g.display_name || g.email).filter(Boolean).join(", ");
  if (guests) push(`Guests: ${guests}`);
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
  push("INSPECTIONS");
  rule();
  const inspections = Array.isArray(data.inspections) ? data.inspections : [];
  const inspectionScope = data.inspections_location_name
    ? `at ${data.inspections_location_name}`
    : "across all locations";
  push(`Completed in the last ${inspectionRangeDays(data.inspections_range_days)} days ${inspectionScope}.`);
  if (inspections.length === 0) {
    push("  (none)");
  } else {
    for (const i of inspections) {
      push(`  • ${fmtDate(i.inspection_date)} — ${val(inspectionPlace(i))}`);
      if (i.inspection_location_branch) push(`      Area: ${i.inspection_location_branch}`);
      push(`      Inspector: ${val(i.reporting_person_email)}`);
      push(`      Status: ${val(i.status_name)}`);
    }
  }
  if (data.inspections_notes) {
    push(`  Notes: ${data.inspections_notes}`);
  }
  push();

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
