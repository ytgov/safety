import express, { Request, Response } from "express";
import { isArray } from "lodash";

import { db as knex } from "../data/db-client";
import { DepartmentService, UnifiedDirectoryService, EmailService, IncidentService, UserService } from "../services";
import {
  Hazard,
  HazardStatuses,
  Incident,
  IncidentAttachment,
  IncidentHazard,
  IncidentHazardTypes,
  IncidentStatuses,
  IncidentStep,
  Scopes,
  SensitivityLevels,
} from "../data/models";
import { InsertableDate } from "../utils/formatters";
import { generateIdentifier, generateSlug } from "../utils/generateSlug";
import { DateTime } from "luxon";

export const offlineReportRouter = express.Router();
const db = new IncidentService();
const emailService = new EmailService();
const directoryService = new UnifiedDirectoryService();
const userService = new UserService();

offlineReportRouter.post("/", async (req: Request, res: Response) => {
  req.body.status = "Initial Report";

  let { date, eventType, description, location_code, location_detail, supervisor_email, urgency } = req.body;

  let currentUserEmail = req.body.on_behalf_email;
  let currentUserId = 1;
  let currentUserName = req.body.on_behalf_email;

  const existingUser = await userService.getByEmail(currentUserEmail);

  if (existingUser) {
    currentUserId = existingUser.id;
    currentUserEmail = existingUser.email;
    currentUserName = existingUser.display_name;

    console.log("Using Existing user", req.body.on_behalf_email);
  } else {
    console.log("Creating new user", req.body.on_behalf_email);

    const createdUser = await userService.create({
      department: "",
      division: "",
      branch: "",
      unit: "",
      display_name: currentUserEmail,
      email: currentUserEmail,
      first_name: "Offline",
      last_name: "Submission",
      title: "",
      is_active: true,
      auth_subject: currentUserEmail,
    });

    currentUserId = createdUser[0].id;
  }

  req.body.email = currentUserEmail;

  const reporting_person_email = req.body.email;

  const defaultHazardType = await knex("hazard_types").orderBy("id").select("id").first();
  const defaultIncidentType = await knex("incident_types").where({ name: eventType }).select("id").first();
  const department = await new DepartmentService().determineDepartment(
    reporting_person_email,
    supervisor_email,
    location_code
  );

  await directoryService.connect();
  const directorySubmitter = await directoryService.searchByEmail(reporting_person_email);
  const directorySupervisor = await directoryService.searchByEmail(supervisor_email);

  const employeeName =
    directorySubmitter && directorySubmitter[0] ? directorySubmitter[0].display_name : reporting_person_email;

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
      incident_type_id: defaultIncidentType.id,
      reporting_person_email,
      urgency_code: urgency,
      location_code,
      location_detail,
      slug: generateSlug(),
      identifier: await generateIdentifier(trx),
      source: "offline",
    } as Incident;

    const insertedIncidents = await trx("incidents").insert(incident).returning("*");
    let insertedIncidentId = insertedIncidents[0].id;

    let steps = new Array<string>();

    if (eventType == "hazard") {
      steps = ["Hazard Identified", "Assessment of Hazard", "Control the Hazard", "Employee Notification"];
    } else {
      steps = ["Incident Reported", "Investigation", "Control Plan", "Controls Implemented", "Employee Notification"];
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
        step.complete_name = currentUserName;
        step.complete_user_id = currentUserId;
      }

      await trx("incident_steps").insert(step);
    }

    if (directorySubmitter && directorySubmitter.length > 0) {
      await emailService.sendIncidentEmployeeNotification(
        { fullName: directorySubmitter[0].display_name, email: reporting_person_email },
        employeeName,
        insertedIncidents[0]
      );

      if (currentUserEmail != reporting_person_email) {
        await emailService.sendIncidentReporterNotification(
          { fullName: currentUserName, email: currentUserEmail },
          employeeName,
          insertedIncidents[0]
        );
      }
    }

    if (directorySupervisor && directorySupervisor.length > 0) {
      await emailService.sendIncidentSupervisorNotification(
        { fullName: directorySupervisor[0].display_name, email: supervisor_email },
        employeeName,
        insertedIncidents[0]
      );
    }

    await trx.commit();
    console.log("ALL GOOD!");
    return res.status(200).json({ data: {} });
  } catch (error) {
    trx.rollback();
    console.log("ERROR IN TRANSACTION", error);
  }

  return res.status(400).json({ data: {} });
});
