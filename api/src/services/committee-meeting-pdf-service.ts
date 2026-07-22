import PDFDocument from "pdfkit";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";

const LOGO_PATH = path.join(__dirname, "../assets/stich-header.png");

interface Person {
  display_name?: string | null;
  email?: string | null;
}

interface DiscussionItem {
  concern?: string | null;
  action?: string | null;
  target_date?: string | null;
}

interface HazardRow {
  hazard?: string | null;
  controlled_at_source?: number | string | null;
  recommended_to_management?: number | string | null;
}

interface RefusalRow {
  location?: string | null;
  reason?: string | null;
  outcome?: string | null;
}

interface MinutesData {
  method?: "upload" | "guided" | null;
  outstanding_items?: DiscussionItem[];
  new_items?: DiscussionItem[];
  hazards?: HazardRow[];
  assessments?: {
    in_progress?: number | string | null;
    completed?: number | string | null;
    hazards_identified?: number | string | null;
    controls_implemented?: number | string | null;
  } | null;
  refusals?: RefusalRow[];
}

interface Meeting {
  id: number;
  committee_name?: string;
  meeting_date?: string;
  quorum?: string | null;
  meet_anyway?: string | null;
  no_loss_incidents_reviewed?: number | null;
  loss_incidents_reviewed?: number | null;
  new_hazards_reviewed?: number | null;
  worker_vacancies?: string | null;
  worker_vacancy_count?: number | null;
  cochairs?: Person[];
  members?: Person[];
  minutes?: string | null;
  minutes_data?: MinutesData | null;
}

function names(people?: Person[]): string {
  return (people ?? [])
    .map((p) => p.display_name || p.email)
    .filter(Boolean)
    .join(", ");
}

const BORDER = "#999999";
const BAND_BG = "#d9d9d9";
const PAD = 5;
const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

function contentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function text(v: any): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

// Postgres returns `date` columns as JS Date objects; the date picker sends ISO strings.
function toDateTime(d?: string | Date | null): DateTime | null {
  if (!d) return null;
  const dt = d instanceof Date ? DateTime.fromJSDate(d) : DateTime.fromISO(d);
  return dt.isValid ? dt : null;
}

function formatDate(d?: string | Date | null): string {
  const dt = toDateTime(d);
  return dt ? dt.toFormat("DD") : d ? String(d) : "";
}

function formatLongDate(d?: string | Date | null): string {
  const dt = toDateTime(d);
  return dt ? dt.toFormat("EEEE MMMM d, yyyy") : d ? String(d) : "";
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

// Draws one grid row across the given column widths and returns the new y.
function row(doc: PDFKit.PDFDocument, widths: number[], cells: string[], header = false): number {
  const x0 = doc.page.margins.left;
  const heights = cells.map((c, i) =>
    doc.font(header ? FONT_BOLD : FONT).fontSize(9).heightOfString(c || " ", { width: widths[i] - PAD * 2 })
  );
  const rowH = Math.max(16, ...heights) + PAD * 2;

  ensureSpace(doc, rowH);
  const y = doc.y;

  let cx = x0;
  cells.forEach((c, i) => {
    if (header) doc.rect(cx, y, widths[i], rowH).fill(BAND_BG);
    doc.rect(cx, y, widths[i], rowH).strokeColor(BORDER).lineWidth(0.5).stroke();
    doc
      .fillColor("#000000")
      .font(header ? FONT_BOLD : FONT)
      .fontSize(9)
      .text(c || "", cx + PAD, y + PAD, { width: widths[i] - PAD * 2 });
    cx += widths[i];
  });

  doc.y = y + rowH;
  doc.x = x0;
  return doc.y;
}

// Full-width shaded band (e.g. "Outstanding Items from Previous Meetings").
function band(doc: PDFKit.PDFDocument, label: string) {
  const w = contentWidth(doc);
  ensureSpace(doc, 20);
  const y = doc.y;
  doc.rect(doc.page.margins.left, y, w, 18).fill(BAND_BG);
  doc.rect(doc.page.margins.left, y, w, 18).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc
    .fillColor("#000000")
    .font(FONT_BOLD)
    .fontSize(9)
    .text(label, doc.page.margins.left + PAD, y + 5, { width: w - PAD * 2, align: "left" });
  doc.y = y + 18;
  doc.x = doc.page.margins.left;
}

function sectionHeading(doc: PDFKit.PDFDocument, label: string, note?: string) {
  ensureSpace(doc, 40);
  doc.x = doc.page.margins.left;
  doc.moveDown(1.6);
  doc.fillColor("#000000").font(FONT_BOLD).fontSize(12).text(label);
  if (note) {
    doc.font(FONT).fontSize(8).fillColor("#555555").text(note, { width: contentWidth(doc) });
  }
  doc.moveDown(0.3);
  doc.fillColor("#000000");
}

function emptyNote(doc: PDFKit.PDFDocument, label = "None recorded.") {
  doc.font(FONT).fontSize(9).fillColor("#777777").text(label);
  doc.fillColor("#000000");
}

// A section is described as a list of ops (grid rows and full-width bands) so its
// total height can be measured before drawing — that lets us keep the whole section
// (heading + table) on one page instead of letting it break across a page boundary.
type RowOp = { band: string } | { widths: number[]; cells: string[]; header?: boolean };

function measureRow(doc: PDFKit.PDFDocument, widths: number[], cells: string[], header = false): number {
  const heights = cells.map((c, i) =>
    doc.font(header ? FONT_BOLD : FONT).fontSize(9).heightOfString(c || " ", { width: widths[i] - PAD * 2 })
  );
  return Math.max(16, ...heights) + PAD * 2;
}

function opsHeight(doc: PDFKit.PDFDocument, ops: RowOp[]): number {
  return ops.reduce((h, op) => h + ("band" in op ? 18 : measureRow(doc, op.widths, op.cells, op.header)), 0);
}

function drawOps(doc: PDFKit.PDFDocument, ops: RowOp[]) {
  for (const op of ops) {
    if ("band" in op) band(doc, op.band);
    else row(doc, op.widths, op.cells, op.header);
  }
}

// Approximate height consumed by sectionHeading (leading gap + title + optional note).
function headingHeight(doc: PDFKit.PDFDocument, note?: string): number {
  let h = 32;
  if (note) h += doc.font(FONT).fontSize(8).heightOfString(note, { width: contentWidth(doc) });
  return h;
}

function renderSection(doc: PDFKit.PDFDocument, title: string, note: string | undefined, ops: RowOp[]) {
  const needed = headingHeight(doc, note) + opsHeight(doc, ops);
  // Only break early when the section fits on a page at all; taller-than-page
  // sections fall back to the per-row page breaks in row().
  if (needed <= doc.page.height - doc.page.margins.top - doc.page.margins.bottom) {
    ensureSpace(doc, needed);
  }
  sectionHeading(doc, title, note);
  drawOps(doc, ops);
}

function discussionRows(doc: PDFKit.PDFDocument, outstanding: DiscussionItem[], newItems: DiscussionItem[]): RowOp[] {
  const total = contentWidth(doc);
  const widths = [total * 0.45, total * 0.38, total * 0.17];
  const ops: RowOp[] = [{ widths, cells: ["Problem or Concern", "Action Taken or Proposed", "Target Date"], header: true }];

  const group = (items: DiscussionItem[], heading: string) => {
    ops.push({ band: heading });
    if (!items || items.length === 0) {
      ops.push({ widths, cells: ["", "", ""] });
      return;
    }
    for (const it of items) {
      ops.push({ widths, cells: [text(it.concern), text(it.action), formatDate(it.target_date)] });
    }
  };

  group(outstanding, "Outstanding Items from Previous Meetings");
  group(newItems, "Open Discussion of New Items");
  return ops;
}

function hazardsRows(doc: PDFKit.PDFDocument, hazards: HazardRow[]): RowOp[] {
  const total = contentWidth(doc);
  const widths = [total * 0.5, total * 0.25, total * 0.25];
  const ops: RowOp[] = [
    { widths, cells: ["Hazards Identified", "Number Controlled at Source", "Number Recommended to Management"], header: true },
  ];
  if (!hazards || hazards.length === 0) {
    ops.push({ widths, cells: ["", "", ""] });
  } else {
    for (const h of hazards) {
      ops.push({ widths, cells: [text(h.hazard), text(h.controlled_at_source), text(h.recommended_to_management)] });
    }
  }
  return ops;
}

function assessmentsRows(doc: PDFKit.PDFDocument, a: MinutesData["assessments"]): RowOp[] {
  const total = contentWidth(doc);
  const widths = [total * 0.25, total * 0.25, total * 0.25, total * 0.25];
  return [
    {
      widths,
      cells: ["Number of Assessments in Progress", "Number of Assessments Completed", "Number of Hazards Identified", "Number of Controls Implemented"],
      header: true,
    },
    { widths, cells: [text(a?.in_progress), text(a?.completed), text(a?.hazards_identified), text(a?.controls_implemented)] },
  ];
}

function refusalsRows(doc: PDFKit.PDFDocument, refusals: RefusalRow[]): RowOp[] {
  const total = contentWidth(doc);
  const widths = [total * 0.33, total * 0.34, total * 0.33];
  const ops: RowOp[] = [{ widths, cells: ["Workplace or Location", "Reason for refusal", "Outcome"], header: true }];
  if (!refusals || refusals.length === 0) {
    ops.push({ widths, cells: ["", "", ""] });
  } else {
    for (const r of refusals) {
      ops.push({ widths, cells: [text(r.location), text(r.reason), text(r.outcome)] });
    }
  }
  return ops;
}

// Small quorum table rendered directly under the header on every meeting.
function quorumTable(doc: PDFKit.PDFDocument, m: Meeting) {
  const total = contentWidth(doc);
  const widths = [total * 0.4, total * 0.14];
  row(doc, widths, ["Did you meet quorum?", text(m.quorum)]);
  if (m.quorum === "No") {
    row(doc, widths, ["Did you meet anyway for informational purposes?", text(m.meet_anyway)]);
  }
  doc.moveDown(0.3);
}

// The numeric review questions only apply to the upload path.
// True when any numeric review answer has been recorded — these can be filled via
// the upload wizard step or the results-page card on any meeting, so render on value
// rather than gating behind method.
function hasReviewNumbers(m: Meeting): boolean {
  return [
    m.no_loss_incidents_reviewed,
    m.loss_incidents_reviewed,
    m.new_hazards_reviewed,
    m.worker_vacancies,
    m.worker_vacancy_count,
  ].some((v) => v !== null && v !== undefined && v !== "");
}

function reviewNumbersRows(doc: PDFKit.PDFDocument, m: Meeting): RowOp[] {
  const total = contentWidth(doc);
  const widths = [total * 0.7, total * 0.3];
  const ops: RowOp[] = [
    { widths, cells: ["Number of no loss (near miss) incidents reviewed", text(m.no_loss_incidents_reviewed)] },
    { widths, cells: ["Number of loss incidents reviewed", text(m.loss_incidents_reviewed)] },
    { widths, cells: ["Number of new hazards reviewed", text(m.new_hazards_reviewed)] },
    { widths, cells: ["Any worker member vacancies (per ROP)?", text(m.worker_vacancies)] },
  ];
  if (m.worker_vacancies === "Yes") {
    ops.push({ widths, cells: ["How many worker vacancies?", text(m.worker_vacancy_count)] });
  }
  return ops;
}

export function buildMinutesPdf(meeting: Meeting, stream: NodeJS.WritableStream) {
  const doc = new PDFDocument({ size: "LETTER", margin: 40 });
  doc.pipe(stream);

  // Stich banner logo (does not advance the cursor, so nudge y past it manually).
  if (fs.existsSync(LOGO_PATH)) {
    const y0 = doc.y;
    doc.image(LOGO_PATH, doc.page.margins.left, y0, { fit: [contentWidth(doc), 46] });
    doc.y = y0 + 46 + 12;
  }

  // Header: committee, date, co-chairs, members
  doc.font(FONT_BOLD).fontSize(18).fillColor("#000000").text(`${meeting.committee_name ?? "Committee"} – Meeting Minutes`);
  doc.moveDown(0.2);
  doc.font(FONT).fontSize(10).fillColor("#333333");
  doc.text(`Date: ${formatLongDate(meeting.meeting_date)}`);
  const cochairs = names(meeting.cochairs);
  const members = names(meeting.members);
  doc.text(`Co-Chairs: ${cochairs || "—"}`);
  doc.text(`Members: ${members || "—"}`);
  doc.fillColor("#000000").moveDown(0.5);

  // Quorum surfaces in a small table right at the top for every meeting, followed by
  // the numeric review answers whenever any have been recorded.
  quorumTable(doc, meeting);
  if (hasReviewNumbers(meeting)) {
    renderSection(doc, "Review Questions", undefined, reviewNumbersRows(doc, meeting));
  }

  const data = meeting.minutes_data ?? {};

  if (data.method === "upload") {
    renderSection(doc, "Minutes", "Minutes were attached as an uploaded document.", []);
  } else {
    renderSection(doc, "Discussion Items", undefined, discussionRows(doc, data.outstanding_items ?? [], data.new_items ?? []));

    renderSection(
      doc,
      "Hazards Identified",
      "From sources other than inspections — worker comments, incident reports or investigation summaries. (WSCA Section 29(e))",
      hazardsRows(doc, data.hazards ?? [])
    );

    renderSection(
      doc,
      "Hazard Assessments",
      "A completed Hazard Assessment identifies and ranks hazards to dedicate resources for controlling them. (WSC Regulation Section 1.03.01)",
      assessmentsRows(doc, data.assessments ?? null)
    );

    renderSection(
      doc,
      "Work Refusals",
      "Workers have the right to refuse work they believe is unsafe. (WSCA Division 5, Sections 47–52)",
      refusalsRows(doc, data.refusals ?? [])
    );
  }

  doc.end();
}
