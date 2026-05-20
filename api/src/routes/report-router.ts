import express, { Request, Response } from "express";
import { isArray, isNil } from "lodash";

import { Knex } from "knex";
import { db as knex } from "../data/db-client";
import {
  DepartmentService,
  UnifiedDirectoryService,
  EmailService,
  IncidentService,
} from "../services";
import {
  Action,
  ActionStatuses,
  HazardStatuses,
  Incident,
  IncidentAttachment,
  IncidentLog,
  IncidentStatuses,
  IncidentStep,
  SensitivityLevels,
  User,
  UserRole,
} from "../data/models";
import { InsertableDate } from "../utils/formatters";
import { DateTime } from "luxon";
import { generateIdentifier, generateSlug } from "../utils/generateSlug";

export const reportRouter = express.Router();
const db = new IncidentService();
const emailService = new EmailService();
const directoryService = new UnifiedDirectoryService();

// Max lengths mirror the string column widths in the incident_logs migration.
// Keep this in sync with the schema so we prefer a truncated audit entry over
// an insert error rejecting a real change to the incident.
const INCIDENT_LOG_COLUMN_LIMITS: Record<string, number> = {
  old_description: 4000,
  old_sensitivity_code: 8,
  old_supervisor: 250,
  old_status_code: 8,
  new_description: 4000,
  new_supervisor: 250,
  new_sensitivity_code: 8,
  new_status_code: 8,
  log_title: 200,
  log_comment: 4000,
  user_action: 16,
};

function truncateLogFields<T extends Record<string, any>>(log: T): T {
  const out: Record<string, any> = { ...log };
  for (const [field, max] of Object.entries(INCIDENT_LOG_COLUMN_LIMITS)) {
    const value = out[field];
    if (typeof value !== "string" || value.length <= max) continue;
    console.warn(
      `incident_logs.${field} truncated from ${value.length} to ${max} characters`,
    );
    out[field] = value.slice(0, max);
  }
  return out as T;
}

async function insertIncidentLog(
  log: Omit<IncidentLog, "id" | "changed_date">,
  trx?: Knex.Transaction,
) {
  const target = trx || knex;
  await target("incident_logs").insert({
    ...truncateLogFields(log),
    changed_date: InsertableDate(DateTime.utc().toISO()),
  });
}

reportRouter.get("/", async (req: Request, res: Response) => {
  const { page, perPage, search, status, urgency, location, department } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const perPageNum = parseInt(perPage as string) || 10;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter(
      (role: UserRole) => role.name === "System Admin",
    ).length > 0;

  const countQuery = function (q: Knex.QueryBuilder) {
    if (!isNil(search)) {
      q.whereRaw(
        `(LOWER("incidents"."description") like '%${search
          .toString()
          .toLowerCase()}%' OR LOWER("incidents"."identifier") like '%${search
          .toString()
          .toLowerCase()}%')`,
      );
    }
    if (!isNil(status)) q.where("status_code", status);
    if (!isNil(urgency)) q.where("urgency_code", urgency);
    if (!isNil(location)) q.where("location_code", location);
    if (!isNil(department)) q.where("department_code", department);
    return q;
  };

  const listQuery = function (q: Knex.QueryBuilder) {
    if (!isNil(search)) {
      q.whereRaw(
        `(LOWER("incidents"."description") like '%${search
          .toString()
          .toLowerCase()}%' OR LOWER("incidents"."identifier") like '%${search
          .toString()
          .toLowerCase()}%')`,
      );
    }
    if (!isNil(status)) q.where("status_code", status);
    if (!isNil(urgency)) q.where("urgency_code", urgency);
    if (!isNil(location)) q.where("location_code", location);
    if (!isNil(department)) q.where("department_code", department);
    q.limit(perPageNum);
    q.offset((pageNum - 1) * perPageNum);
    return q;
  };

  const list = await db.getAll(
    userIsAdmin ? "System Admin" : req.user.email,
    listQuery,
  );
  const count = await db.getCount(
    userIsAdmin ? "System Admin" : req.user.email,
    countQuery,
  );

  const locations = await knex("locations");
  const types = await knex("incident_types");
  const statuses = await knex("incident_statuses");
  const access = await knex("incident_users_view").whereRaw(
    `LOWER("user_email") = ?`,
    [req.user.email.toLowerCase()],
  );

  for (const item of list) {
    item.location = locations.find((l: any) => l.code === item.location_code);
    item.type = types.find((t: any) => t.id === item.incident_type_id);
    item.status = statuses.find((s: any) => s.code === item.status_code);
    item.access = access.filter((a: any) => a.incident_id === item.id) ?? [];
  }

  return res.json({ data: list, totalCount: count?.count });
});

reportRouter.get("/csv-export", async (req: Request, res: Response) => {
  const { search, status, urgency, location, department } = req.query;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter(
      (role: UserRole) => role.name === "System Admin",
    ).length > 0;

  const userHasRole = (req.user.roles = req.user.roles || []).length > 0;

  const listQuery = function (q: Knex.QueryBuilder) {
    if (!isNil(search)) {
      q.whereRaw(
        `LOWER("incidents"."description") like '%${search
          .toString()
          .toLowerCase()}%'`,
      );
    }
    if (!isNil(status)) q.where("status_code", status);
    if (!isNil(urgency)) q.where("urgency_code", urgency);
    if (!isNil(location)) q.where("location_code", location);
    if (!isNil(department)) q.where("department_code", department);
    return q;
  };

  const list = await db.getAll(
    userIsAdmin ? "System Admin" : req.user.email,
    listQuery,
  );

  const locations = await knex("locations");
  const types = await knex("incident_types");
  const statuses = await knex("incident_statuses");
  const access = await knex("incident_users_view").whereRaw(
    `LOWER("user_email") = ?`,
    [req.user.email.toLowerCase()],
  );

  for (const item of list) {
    item.location = locations.find((l: any) => l.code === item.location_code);
    item.type = types.find((t: any) => t.id === item.incident_type_id);
    item.status = statuses.find((s: any) => s.code === item.status_code);
    item.access = access.filter((a: any) => a.incident_id === item.id) ?? [];
  }

  const csvContent = db.generateIncidentsCsvString(list, userHasRole);

  return res.json({ csvContent: csvContent });
});

reportRouter.get("/my-reports", async (req: Request, res: Response) => {
  const list = await db.getByReportingEmail(req.user.email);
  return res.json({ data: list });
});

reportRouter.get(
  "/my-supervisor-reports",
  async (req: Request, res: Response) => {
    const list = await db.getBySupervisorEmail(req.user.email);
    return res.json({ data: list });
  },
);

reportRouter.get("/role/:role", async (req: Request, res: Response) => {
  const { role } = req.params;
  const roleArray = (role ?? "").split(",");

  const userRoles = (req.user.roles = req.user.roles || []);
  const matchingRoles = userRoles.filter((r: UserRole) =>
    roleArray.includes(r.name ?? ""),
  );
  const matchingDepartments = matchingRoles.map(
    (r: UserRole) => r.department_code,
  );

  const query = function (query: Knex.QueryBuilder) {
    query.whereIn("department_code", matchingDepartments);

    query.whereNot({ status_code: IncidentStatuses.CLOSED.code });
    return query;
  };

  const list = await db.getAll(req.user.email, query);
  res.json({ data: list });
});

reportRouter.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter(
      (role: UserRole) => role.name === "System Admin",
    ).length > 0;

  const data = await db.getBySlug(
    slug,
    userIsAdmin ? "System Admin" : req.user.email,
  );

  if (!data) return res.status(404).send();

  return res.json({ data });
});

reportRouter.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    description,
    investigation_notes,
    additional_description,
    urgency_code,
    incident_type_id,
    hs_recommendations,
    committee_supervisor_response,
    committee_supervisor_rationale,
  } = req.body;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter(
      (role: UserRole) => role.name === "System Admin",
    ).length > 0;

  const data = await db.getById(
    id,
    userIsAdmin ? "System Admin" : req.user.email,
  );
  if (!data) return res.status(404).send();

  await knex("incidents").where({ id }).update({
    description,
    investigation_notes,
    additional_description,
    urgency_code,
    incident_type_id,
    hs_recommendations,
    committee_supervisor_response,
    committee_supervisor_rationale,
  });

  const commentParts: string[] = [];
  if (data.urgency_code !== urgency_code) commentParts.push(`Urgency: ${data.urgency_code} → ${urgency_code}`);
  if (data.investigation_notes !== investigation_notes) commentParts.push("Investigation notes updated");
  if (data.additional_description !== additional_description) commentParts.push("Additional description updated");
  if (data.hs_recommendations !== hs_recommendations) commentParts.push("H&S recommendations updated");
  if (data.committee_supervisor_response !== committee_supervisor_response) commentParts.push(`Supervisor response: ${committee_supervisor_response}`);
  if (data.committee_supervisor_rationale !== committee_supervisor_rationale) commentParts.push("Supervisor rationale updated");

  await insertIncidentLog({
    incident_id: parseInt(id),
    old_description: data.description,
    old_incident_type_id: data.incident_type_id,
    new_description: description,
    new_incident_type_id: incident_type_id,
    changer_user_id: req.user.id,
    log_title: "Incident Updated",
    log_comment: commentParts.length > 0 ? commentParts.join("; ") : undefined,
    user_action: "UPDATE",
  });

  return res.json({
    data: {},
    messages: [{ variant: "success", text: "Incident Saved" }],
  });
});

reportRouter.put("/:id/admin-edit", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { department_code, supervisor_email, location_code, location_detail, description } = req.body;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter(
      (role: UserRole) => role.name === "System Admin",
    ).length > 0;

  if (!userIsAdmin) return res.status(403).send({ messages: [{ variant: "error", text: "Unauthorized" }] });

  const data = await db.getById(id, "System Admin");
  if (!data) return res.status(404).send();

  await knex("incidents").where({ id }).update({
    department_code,
    supervisor_email,
    location_code,
    location_detail,
    description,
  });

  const commentParts: string[] = [];
  if (data.department_code !== department_code) commentParts.push(`Department: ${data.department_code} → ${department_code}`);
  if (data.location_code !== location_code) commentParts.push(`Location: ${data.location_code} → ${location_code}`);
  if (data.location_detail !== location_detail) commentParts.push(`Location detail: ${data.location_detail || "(none)"} → ${location_detail || "(none)"}`);

  await insertIncidentLog({
    incident_id: parseInt(id),
    old_description: data.description,
    old_supervisor: data.supervisor_email,
    new_description: description,
    new_supervisor: supervisor_email,
    changer_user_id: req.user.id,
    log_title: "Admin Edit",
    log_comment: commentParts.length > 0 ? commentParts.join("; ") : undefined,
    user_action: "ADMNEDIT",
  });

  return res.json({
    data: {},
    messages: [{ variant: "success", text: "Incident Updated" }],
  });
});

reportRouter.post("/:id/investigation", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { investigation_data } = req.body;

  investigation_data.completed_on = new Date().toISOString();
  investigation_data.completed_by = req.user.display_name;
  investigation_data.completed_by_ud = req.user.id;
  const jsonString = JSON.stringify(investigation_data);

  await knex("investigations").insert({
    incident_id: id,
    investigation_data: jsonString,
  });

  await insertIncidentLog({
    incident_id: parseInt(id),
    changer_user_id: req.user.id,
    log_title: "Investigation Added",
    log_comment: `Completed by ${req.user.display_name}`,
    user_action: "INVEST",
  });

  return res.json({
    data: {},
    messages: [{ variant: "success", text: "Incident Saved" }],
  });
});

reportRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const trx = await knex.transaction();

  try {
    const linkedHazards = await trx("incident_hazards").where({
      incident_id: id,
    });
    await trx("incident_hazards").where({ incident_id: id }).delete();

    for (const link of linkedHazards) {
      await trx("actions").where({ hazard_id: link.hazard_id }).delete();
      await trx("hazard_attachments")
        .where({ hazard_id: link.hazard_id })
        .delete();
      await trx("hazards").where({ id: link.hazard_id }).delete();
    }

    await trx("actions").where({ incident_id: id }).delete();
    await trx("incident_attachments").where({ incident_id: id }).delete();
    await trx("incident_steps").where({ incident_id: id }).delete();
    await trx("investigations").where({ incident_id: id }).delete();
    await trx("incident_users").where({ incident_id: id }).delete();
    await trx("incident_logs").where({ incident_id: id }).delete();
    await trx("incidents").where({ id }).delete();

    trx.commit();
    return res.json({
      data: {},
      messages: [{ variant: "success", text: "Incident Removed" }],
    });
  } catch (error) {
    console.log("ERROR IN TRANSACTION", error);
    trx.rollback();
    return res.json({
      data: {},
      messages: [{ variant: "error", text: "Error Removing Incident" }],
    });
  }
});

reportRouter.post("/", async (req: Request, res: Response) => {
  req.body.email = req.user.email;
  req.body.status = "Initial Report";

  let {
    date,
    eventType,
    description,
    location_code,
    location_detail,
    supervisor_email,
    supervisor_alt_email,
    on_behalf,
    on_behalf_email,
    urgency,
    additional_people,
  } = req.body;

  let reporting_person_email = req.user.email;
  let investigation_notes = null;

  await directoryService.connect();

  if (on_behalf == "Yes") {
    const directoryOnBehalf = await directoryService.search(on_behalf_email);

    if (directoryOnBehalf && directoryOnBehalf.length == 1) {
      reporting_person_email = directoryOnBehalf[0].email;
    } else {
      reporting_person_email = req.user.email;
      investigation_notes = `Report submitted on behalf of ${on_behalf_email}.`;
    }
  }

  const defaultIncidentType = await knex("incident_types")
    .where({ name: eventType })
    .select("id")
    .first();

  const department = await new DepartmentService().determineDepartment(
    [reporting_person_email, req.user.email, supervisor_email],
    location_code,
  );

  const directorySubmitter = await directoryService.searchByEmail(
    reporting_person_email,
  );

  const directorySupervisor =
    await directoryService.searchByEmail(supervisor_email);

  const employeeName =
    directorySubmitter && directorySubmitter[0]
      ? directorySubmitter[0].display_name
      : reporting_person_email;

  const trx = await knex.transaction();

  try {
    const incident = {
      created_at: InsertableDate(DateTime.utc().toISO()),
      reported_at: InsertableDate(date),
      description,
      department_code: department.code,
      status_code: IncidentStatuses.OPEN.code,
      sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
      supervisor_email,
      supervisor_alt_email,
      incident_type_id: defaultIncidentType.id,
      reporting_person_email,
      proxy_user_id: req.user.id,
      urgency_code: urgency,
      location_code,
      location_detail,
      slug: generateSlug(),
      investigation_notes,
      identifier: await generateIdentifier(trx),
      source: "online",
    } as Incident;

    const insertedIncidents = await trx("incidents")
      .insert(incident)
      .returning("*");
    let insertedIncidentId = insertedIncidents[0].id;

    await insertIncidentLog(
      {
        incident_id: insertedIncidentId,
        new_description: description,
        new_status_code: IncidentStatuses.OPEN.code,
        new_sensitivity_code: SensitivityLevels.NOT_SENSITIVE.code,
        new_supervisor: supervisor_email,
        new_incident_type_id: defaultIncidentType.id,
        changer_user_id: req.user.id,
        log_title: "Incident Created",
        log_comment: `Location: ${location_code}${location_detail ? " - " + location_detail : ""}, Urgency: ${urgency}`,
        user_action: "CREATE",
      },
      trx,
    );

    let peopleArray = additional_people ?? [];
    peopleArray = isArray(peopleArray) ? peopleArray : peopleArray.split(",");

    const invitedPeople: string[] = [];
    if (peopleArray.length > 0) {
      for (const email of peopleArray) {
        const user_email = (email ?? "").trim();
        if (user_email == "") continue;

        await trx("incident_users").insert({
          user_email,
          incident_id: insertedIncidentId,
          reason: "supervisor",
        });
        invitedPeople.push(user_email);
      }
    }

    let steps = new Array<string>();

    if (eventType == "hazard") {
      steps = [
        "Hazard Identified",
        "Assessment of Hazard",
        "Control the Hazard",
        "Employee Notification",
      ];
    } else {
      steps = [
        "Incident Reported",
        "Investigation",
        "Control Plan",
        "Controls Implemented",
        "Employee Notification",
      ];
    }

    for (let i = 1; i <= steps.length; i++) {
      const step_title = steps[i - 1];

      const step = {
        incident_id: insertedIncidentId,
        step_title,
        order: i,
        activate_date: i == 1 ? new Date() : null,
      } as IncidentStep;

      if (i == 1) {
        (step as any).complete_date = InsertableDate(DateTime.utc().toISO());
        step.complete_name = req.user.display_name;
        step.complete_user_id = req.user.id;
      }

      await trx("incident_steps").insert(step);
    }

    if (req.files && req.files.files) {
      let files = req.files.files;

      if (!isArray(files)) files = [files];

      for (const file of files) {
        let attachment = {
          incident_id: insertedIncidentId,
          added_by_email: req.user.email,
          file_name: file.name,
          file_type: file.mimetype,
          file_size: file.size,
          file: file.data,
          added_date: InsertableDate(DateTime.utc().toISO()),
        } as IncidentAttachment;

        await trx("incident_attachments").insert(attachment);
      }
    }

    if (directorySubmitter && directorySubmitter.length > 0) {
      await emailService.sendIncidentEmployeeNotification(
        {
          fullName: directorySubmitter[0].display_name,
          email: reporting_person_email,
        },
        employeeName,
        insertedIncidents[0],
      );

      if (req.user.email != reporting_person_email) {
        await emailService.sendIncidentReporterNotification(
          { fullName: req.user.display_name, email: req.user.email },
          employeeName,
          insertedIncidents[0],
        );
      }
    }

    if (directorySupervisor && directorySupervisor.length > 0) {
      await emailService.sendIncidentSupervisorNotification(
        {
          fullName: directorySupervisor[0].display_name,
          email: supervisor_email,
        },
        employeeName,
        insertedIncidents[0],
      );
    } else {
      console.log(
        `Supervisor email ${supervisor_email} not found in directory, skipping notification email.`,
      );
    }

    await trx.commit();

    for (const user_email of invitedPeople) {
      const directoryInvitee = await directoryService.searchByEmail(user_email);
      const inviteeName =
        directoryInvitee && directoryInvitee[0]
          ? directoryInvitee[0].display_name
          : user_email;
      await emailService.sendIncidentInviteNotification(
        { fullName: inviteeName, email: user_email },
        insertedIncidents[0],
      );
    }

    return res.status(200).json({ data: {} });
  } catch (error: any) {
    await trx.rollback();
    console.log("ERROR IN TRANSACTION", error);
    return res.status(500).json({ data: {}, error: error.message || "Internal server error" });
  }
});

reportRouter.put(
  "/:id/step/:step_id/:operation",
  async (req: Request, res: Response) => {
    const { id, step_id, operation } = req.params;

    const incident = await knex("incidents").where({ id }).first();
    const step = await knex("incident_steps")
      .where({ incident_id: id, id: step_id })
      .first();

    if (step) {
      if (operation == "complete") {
        await knex("incident_steps")
          .where({ incident_id: id, id: step_id })
          .update({
            complete_name: req.user.display_name,
            complete_date: InsertableDate(DateTime.utc().toISO()),
            complete_user_id: req.user.id,
          });

        await insertIncidentLog({
          incident_id: parseInt(id),
          changer_user_id: req.user.id,
          log_title: `Step Completed: ${step.step_title}`,
          user_action: "STEPCMP",
        });
      } else if (operation == "revert") {
        await knex("incident_steps")
          .where({ incident_id: id, id: step_id })
          .update({
            complete_name: null,
            complete_date: null,
            complete_user_id: null,
          });

        const commentParts: string[] = [];
        if (step.step_title == "Investigation") {
          await knex("actions").where({ incident_id: id }).delete();
          await knex("investigations").where({ incident_id: id }).delete();

          const linkedHazards = await knex("incident_hazards").where({
            incident_id: id,
          });
          await knex("incident_hazards").where({ incident_id: id }).delete();

          for (const link of linkedHazards) {
            await knex("hazard_attachments")
              .where({ hazard_id: link.hazard_id })
              .delete();
            await knex("hazards").where({ id: link.hazard_id }).delete();
          }
          commentParts.push("Investigation data, actions, and linked hazards removed");
        }

        await insertIncidentLog({
          incident_id: parseInt(id),
          changer_user_id: req.user.id,
          log_title: `Step Reverted: ${step.step_title}`,
          log_comment: commentParts.length > 0 ? commentParts.join("; ") : undefined,
          user_action: "STEPREV",
        });
      }
    }

    const allSteps = await knex("incident_steps").where({ incident_id: id });
    let allComplete = true;

    for (const step of allSteps) {
      if (!step.complete_date) allComplete = false;
    }

    const oldStatus = incident?.status_code;
    let newStatus: string;

    if (allComplete) {
      newStatus = IncidentStatuses.CLOSED.code;
      await knex("incidents")
        .where({ id })
        .update({ status_code: newStatus });
    } else {
      newStatus = IncidentStatuses.IN_PROGRESS.code;
      await knex("incidents")
        .where({ id })
        .update({ status_code: newStatus });
    }

    if (oldStatus !== newStatus) {
      await insertIncidentLog({
        incident_id: parseInt(id),
        old_status_code: oldStatus,
        new_status_code: newStatus,
        changer_user_id: req.user.id,
        log_title: `Status Changed: ${oldStatus} → ${newStatus}`,
        user_action: "STATUS",
      });
    }

    return res.json({ data: {} });
  },
);

reportRouter.get("/:slug/linked-users", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const userIsAdmin =
    (req.user.roles = req.user.roles || []).filter(
      (role: UserRole) => role.name === "System Admin",
    ).length > 0;

  const incident = await db.getBySlug(
    slug,
    userIsAdmin ? "System Admin" : req.user.email,
  );

  if (incident) {
    const list = await knex("incident_users").where({
      incident_id: incident.id,
    });
    return res.json({ data: list });
  }

  res.json({ data: [] });
});

reportRouter.post(
  "/:slug/linked-users",
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const userIsAdmin =
      (req.user.roles = req.user.roles || []).filter(
        (role: UserRole) => role.name === "System Admin",
      ).length > 0;

    const incident = await db.getBySlug(
      slug,
      userIsAdmin ? "System Admin" : req.user.email,
    );

    if (incident) {
      await knex("incident_users").insert(req.body);

      const recipient = req.body.user_email;
      const directorySubmitter =
        await directoryService.searchByEmail(recipient);
      const employeeName =
        directorySubmitter && directorySubmitter[0]
          ? directorySubmitter[0].display_name
          : recipient;
      await emailService.sendIncidentInviteNotification(
        { fullName: employeeName, email: recipient },
        incident,
      );

      await insertIncidentLog({
        incident_id: incident.id!,
        changer_user_id: req.user.id,
        log_title: "User Added",
        log_comment: `Added ${recipient} (${req.body.reason || "linked"})`,
        user_action: "ADDUSER",
      });

      return res.json({ data: {} });
    }

    res.json({ data: [] });
  },
);

reportRouter.delete(
  "/:slug/linked-users/:id",
  async (req: Request, res: Response) => {
    const { slug, id } = req.params;

    const userIsAdmin =
      (req.user.roles = req.user.roles || []).filter(
        (role: UserRole) => role.name === "System Admin",
      ).length > 0;

    const incident = await db.getBySlug(
      slug,
      userIsAdmin ? "System Admin" : req.user.email,
    );

    if (incident) {
      const userRecord = await knex("incident_users").where({ id }).first();
      const list = await knex("incident_users").where({ id }).delete();

      await insertIncidentLog({
        incident_id: incident.id!,
        changer_user_id: req.user.id,
        log_title: "User Removed",
        log_comment: userRecord ? `Removed ${userRecord.user_email}` : undefined,
        user_action: "RMUSER",
      });

      return res.json({ data: list });
    }

    res.json({ data: [] });
  },
);

reportRouter.post(
  "/:id/send-notification",
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { recipients } = req.body;

    const incident = await knex("incidents").where({ id }).first();
    if (!incident) return res.status(404).send();

    const recipientList = recipients.split(/[\s,;]+/).filter(Boolean);

    for (const recipient of recipientList) {
      const directorySubmitter =
        await directoryService.searchByEmail(recipient);
      const employeeName =
        directorySubmitter && directorySubmitter[0]
          ? directorySubmitter[0].display_name
          : recipient;

      await emailService.sendIncidentInviteNotification(
        { fullName: employeeName, email: recipient },
        incident,
      );
    }

    return res.json({
      data: {},
      messages: [{ variant: "success", text: "Email Sent" }],
    });
  },
);

reportRouter.post(
  "/:id/send-employee-notification",
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const incident = await knex("incidents").where({ id }).first();
    if (!incident) return res.status(404).send();

    // If committee review occurred, supervisor must have responded before notification
    if (
      incident.committee_review_complete_date &&
      !incident.committee_supervisor_response
    ) {
      return res.status(400).json({
        messages: [
          {
            variant: "error",
            text: "Supervisor must review committee recommendations before sending notification",
          },
        ],
      });
    }

    const directorySubmitter = await directoryService.searchByEmail(
      incident.reporting_person_email,
    );
    const employeeName =
      directorySubmitter && directorySubmitter[0]
        ? directorySubmitter[0].display_name
        : incident.reporting_person_email;

    await emailService.sendIncidentCompleteEmployeeNotification(
      { fullName: employeeName, email: incident.reporting_person_email },
      incident,
    );

    return res.json({
      data: {},
      messages: [{ variant: "success", text: "Email Sent" }],
    });
  },
);

reportRouter.post(
  "/:id/send-committee-request",
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { committeeId } = req.body;

    const incident = await knex("incidents").where({ id }).first();
    if (!incident) return res.status(404).send();

    const committee = await knex("committees")
      .where({ id: committeeId })
      .first();
    if (!committee) return res.status(404).send();

    const committeeUsers = await knex("committee_users").where({
      committee_id: committeeId,
    });

    if (incident.committee_review_request_date) {
      return res.status(400).send("Committee review already requested");
    }

    await knex("incidents")
      .where({ id })
      .update({
        committee_review_request_date: InsertableDate(DateTime.utc().toISO()),
      });

    await insertIncidentLog({
      incident_id: parseInt(id),
      changer_user_id: req.user.id,
      log_title: "Committee Review Requested",
      log_comment: `Committee: ${committee.name || committeeId}`,
      user_action: "CMTEREQ",
    });

    for (const user of committeeUsers) {
      const userRecord = await knex("users")
        .where({ id: user.user_id })
        .first();

      if (!userRecord) continue;

      await knex("incident_users").insert({
        user_email: userRecord.email,
        incident_id: id,
        reason: "committee",
      });

      await emailService.sendIncidentInviteNotification(
        { fullName: userRecord.display_name, email: userRecord.email },
        incident,
      );
    }

    return res.json({
      data: {},
      messages: [{ variant: "success", text: "Email Sent" }],
    });
  },
);

reportRouter.post(
  "/:id/complete-committee-review",
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const incident = await knex("incidents").where({ id }).first();
    if (!incident) return res.status(404).send();

    if (!incident.committee_review_request_date) {
      return res.status(400).send("Committee review has not been requested");
    }

    if (incident.committee_review_complete_date) {
      return res.status(400).send("Committee review already completed");
    }

    await knex("incidents")
      .where({ id })
      .update({
        committee_review_complete_date: InsertableDate(DateTime.utc().toISO()),
      });

    await insertIncidentLog({
      incident_id: parseInt(id),
      changer_user_id: req.user.id,
      log_title: "Committee Review Completed",
      user_action: "CMTECMP",
    });

    await emailService.sendIncidentReviewCompleteNotification(
      {
        fullName: incident.supervisor_email,
        email: incident.supervisor_email,
      },
      incident,
    );

    return res.json({
      data: {},
      messages: [{ variant: "success", text: "Committee Review Completed" }],
    });
  },
);

export async function updateActionHazards(
  action: Action,
  status_code: string,
  urgency_code: string,
  control?: string | null,
) {
  let hazardStatus = HazardStatuses.OPEN.code;

  if (status_code == ActionStatuses.IN_PROGRESS.code)
    hazardStatus = HazardStatuses.IN_PROGRESS.code;
  if (status_code == ActionStatuses.COMPLETE.code)
    hazardStatus = HazardStatuses.REMEDIATED.code;

  const hazards = await knex("hazards").where({ id: action.hazard_id });

  for (const hazard of hazards) {
    await knex("hazards")
      .where({ id: hazard.id })
      .update({ urgency_code, status_code: hazardStatus, control });
  }
}

export async function updateIncidentStatus(action: Action, user: User) {
  if (action.incident_id) {
    const allActions = await knex("actions").where({
      incident_id: action.incident_id,
    });

    let allComplete = true;
    let allReady = true;

    for (const act of allActions) {
      if (act.status_code == ActionStatuses.OPEN.code) {
        allReady = false;
        allComplete = false;
        break;
      }
      if (act.status_code != ActionStatuses.COMPLETE.code) allComplete = false;
    }

    const steps = await knex("incident_steps")
      .where({ incident_id: action.incident_id })
      .orderBy("order");
    const completeStepNames = ["Controls Implemented", "Control the Hazard"];
    const readyStepNames = ["Control Plan", "Assessment of Hazard"];

    for (const step of steps) {
      if (completeStepNames.includes(step.step_title)) {
        if (allComplete && !step.complete_date) {
          await knex("incident_steps")
            .where({ incident_id: action.incident_id, id: step.id })
            .update({
              complete_date: InsertableDate(DateTime.utc().toISO()),
              complete_name: user.display_name,
              complete_user_id: user.id,
            });

          await insertIncidentLog({
            incident_id: action.incident_id!,
            changer_user_id: user.id,
            log_title: `Step Auto-Completed: ${step.step_title}`,
            log_comment: "All actions complete",
            user_action: "STEPCMP",
          });
        } else if (!allComplete && step.complete_date) {
          await knex("incident_steps")
            .where({ incident_id: action.incident_id, id: step.id })
            .update({
              complete_date: null,
              complete_name: null,
              complete_user_id: null,
            });

          await insertIncidentLog({
            incident_id: action.incident_id!,
            changer_user_id: user.id,
            log_title: `Step Auto-Reverted: ${step.step_title}`,
            log_comment: "Not all actions complete",
            user_action: "STEPREV",
          });
        }
      }

      if (readyStepNames.includes(step.step_title)) {
        if (allReady && !step.complete_date) {
          await knex("incident_steps")
            .where({ incident_id: action.incident_id, id: step.id })
            .update({
              complete_date: InsertableDate(DateTime.utc().toISO()),
              complete_name: user.display_name,
              complete_user_id: user.id,
            });

          await insertIncidentLog({
            incident_id: action.incident_id!,
            changer_user_id: user.id,
            log_title: `Step Auto-Completed: ${step.step_title}`,
            log_comment: "All actions ready",
            user_action: "STEPCMP",
          });
        } else if (!allReady && step.complete_date) {
          await knex("incident_steps")
            .where({ incident_id: action.incident_id, id: step.id })
            .update({
              complete_date: null,
              complete_name: null,
              complete_user_id: null,
            });

          await insertIncidentLog({
            incident_id: action.incident_id!,
            changer_user_id: user.id,
            log_title: `Step Auto-Reverted: ${step.step_title}`,
            log_comment: "Not all actions ready",
            user_action: "STEPREV",
          });
        }
      }
    }
  }
}
