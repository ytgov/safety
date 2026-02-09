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

reportRouter.get("/", async (req: Request, res: Response) => {
  const { page, perPage, search, status, urgency, location } = req.query;

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
  const access = await knex("incident_users_view").where({
    user_email: req.user.email,
  });

  for (const item of list) {
    item.location = locations.find((l: any) => l.code === item.location_code);
    item.type = types.find((t: any) => t.id === item.incident_type_id);
    item.status = statuses.find((s: any) => s.code === item.status_code);
    item.access = access.filter((a: any) => a.incident_id === item.id) ?? [];
  }

  return res.json({ data: list, totalCount: count?.count });
});

reportRouter.get("/csv-export", async (req: Request, res: Response) => {
  const { search, status, urgency, location } = req.query;

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
    return q;
  };

  const list = await db.getAll(
    userIsAdmin ? "System Admin" : req.user.email,
    listQuery,
  );

  const locations = await knex("locations");
  const types = await knex("incident_types");
  const statuses = await knex("incident_statuses");
  const access = await knex("incident_users_view").where({
    user_email: req.user.email,
  });

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
  });

  return res.json({
    data: {},
    messages: [{ variant: "success", text: "Incident Saved" }],
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

  const reporting_person_email =
    on_behalf == "Yes" ? on_behalf_email : req.user.email;

  const defaultIncidentType = await knex("incident_types")
    .where({ name: eventType })
    .select("id")
    .first();
  const department = await new DepartmentService().determineDepartment(
    reporting_person_email,
    supervisor_email,
    location_code,
  );

  await directoryService.connect();
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
      identifier: await generateIdentifier(trx),
      source: "online",
    } as Incident;

    const insertedIncidents = await trx("incidents")
      .insert(incident)
      .returning("*");
    let insertedIncidentId = insertedIncidents[0].id;

    let peopleArray = additional_people ?? [];
    peopleArray = isArray(peopleArray) ? peopleArray : peopleArray.split(",");

    if (peopleArray.length > 0) {
      for (const email of peopleArray) {
        const user_email = (email ?? "").trim();
        if (user_email == "") continue;

        await trx("incident_users").insert({
          user_email,
          incident_id: insertedIncidentId,
          reason: "supervisor",
        });
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
        activate_date: i == i ? new Date() : null,
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
    }

    await trx.commit();
    return res.status(200).json({ data: {} });
  } catch (error) {
    trx.rollback();
    console.log("ERROR IN TRANSACTION", error);
  }

  return res.status(400).json({ data: {} });
});

reportRouter.put(
  "/:id/step/:step_id/:operation",
  async (req: Request, res: Response) => {
    const { id, step_id, operation } = req.params;

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

        // send email to supervisor if the CommitteeReview step is complete.
        if (step.step_title == "Committee Review") {
          const incident = await knex("incidents").where({ id }).first();

          await emailService.sendIncidentReviewCompleteNotification(
            {
              fullName: incident.supervisor_email,
              email: incident.supervisor_email,
            },
            incident,
          );
        }
      } else if (operation == "revert") {
        await knex("incident_steps")
          .where({ incident_id: id, id: step_id })
          .update({
            complete_name: null,
            complete_date: null,
            complete_user_id: null,
          });

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
        }
      }
    }

    const allSteps = await knex("incident_steps").where({ incident_id: id });
    let allComplete = true;

    for (const step of allSteps) {
      if (!step.complete_date) allComplete = false;
    }

    if (allComplete) {
      await knex("incidents")
        .where({ id })
        .update({ status_code: IncidentStatuses.CLOSED.code });
    } else {
      await knex("incidents")
        .where({ id })
        .update({ status_code: IncidentStatuses.IN_PROGRESS.code });
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
      const list = await knex("incident_users").where({ id }).delete();
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

    const incidentSteps = await knex("incident_steps")
      .where({ incident_id: id })
      .orderBy("order");

    const implementedStep = incidentSteps.find(
      (step: IncidentStep) => step.step_title == "Controls Implemented",
    );
    const requestStep = incidentSteps.find(
      (step: IncidentStep) => step.step_title == "Committee Review",
    );

    if (!isNil(requestStep)) return res.status(400).send("Step already exists");

    const newStep = {
      incident_id: id,
      step_title: "Committee Review",
      order: implementedStep.order,
      activate_date: new Date(),
    };

    const stepsToIncrement = await knex("incident_steps")
      .where({ incident_id: id })
      .andWhere("order", ">=", implementedStep.order)
      .orderBy("order", "desc");

    for (const step of stepsToIncrement) {
      await knex("incident_steps")
        .where({ incident_id: id, id: step.id })
        .update({
          order: step.order + 1,
        });
    }

    await knex("incident_steps").insert(newStep);

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
        } else if (!allComplete && step.complete_date) {
          await knex("incident_steps")
            .where({ incident_id: action.incident_id, id: step.id })
            .update({
              complete_date: null,
              complete_name: null,
              complete_user_id: null,
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
        } else if (!allReady && step.complete_date) {
          await knex("incident_steps")
            .where({ incident_id: action.incident_id, id: step.id })
            .update({
              complete_date: null,
              complete_name: null,
              complete_user_id: null,
            });
        }
      }
    }
  }
}
