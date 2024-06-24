import express, { Request, Response } from "express";
import { IncidentService } from "../services";
import { DateTime } from "luxon";
import { db as knex } from "../data";
import { DB_CLIENT } from "../config";
import { Incident, IncidentAttachment } from "../data/models";
import { isArray } from "lodash";

export const reportRouter = express.Router();
const db = new IncidentService();

reportRouter.get("/my-reports", async (req: Request, res: Response) => {
  const list = await db.getByReportingEmail(req.user.email);
  return res.json({ data: list });
});

reportRouter.get("/my-supervisor-reports", async (req: Request, res: Response) => {
  const list = await db.getBySupervisorEmail(req.user.email);
  return res.json({ data: list });
});

reportRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const list = await db.getById(id);
  return res.json({ data: list });
});

reportRouter.post("/", async (req: Request, res: Response) => {
  const {} = req.body;
  req.body.email = req.user.email;
  req.body.status = "Initial Report";

  let { date, eventType, description, location_code, location_detail, supervisor_email, on_behalf, on_behalf_email } =
    req.body;
  let cVal = DateTime.fromISO(date);

  const incident_type = await knex("incident_types").where({ name: eventType }).select("id").first();

  const report = {
    created_at: new Date(),
    description,
    department_code: "PSC", // TODO: make this lookup based on submitting person
    status_code: "REP", // Initial Report
    sensitivity_code: "0", // Not Sensitive
    supervisor_email,

    incident_type_id: incident_type.id,

    /*
      THESE ARE FOR HAZARD ONLY
      location_code,
      location_detail,
      scope_code, 
      hazard_type_id, 
      reopen_count: 0, */

    /*
      TODO: Figure out if this required
      proxy_role_type_id,
      */

    reporting_person_email: on_behalf == "Yes" ? on_behalf_email : req.user.email,
    proxy_user_id: req.user.id,
  } as Incident;

  if (DB_CLIENT == "oracledb") {
    (report as any).created_at = knex.raw(
      `TO_TIMESTAMP('${cVal.toFormat("yyyy-MM-dd HH:mm:ss")}', 'YYYY-MM-DD HH24:MI:SS')`
    );
    //report.date = knex.raw(`TO_TIMESTAMP('${dVal.toFormat("yyyy-MM-dd HH:mm:ss")}', 'YYYY-MM-DD HH24:MI:SS')`);
  }

  console.log("INSERTING REPORT", report);

  const insertedReports = await db.create(report);

  let insertedId = insertedReports[0].id;

console.log("req.file", req.files)


  if (req.files && req.files.files) {
    let files = req.files.files;

    if (!isArray(files)) files = [files];

    for (const file of files) {
      let attachment = {
        incident_id: insertedId,
        added_by_email: req.user.email,
        file_name: file.name,
        file_type: file.mimetype,
        file_size: file.size,
        file: file.data,
        added_date: new Date(),
      } as IncidentAttachment;


      console.log("INSERT ATTACH", attachment)
      await knex("incident_attachments").insert(attachment);
    }
  }

  return res.status(500).json({ data: [] });
});
