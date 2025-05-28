import nodemailer, { Transporter, TransportOptions } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { MAIL_CONFIG, MAIL_FROM, APPLICATION_NAME, FRONTEND_URL } from "../config";
import fs from "fs";
import path from "path";
import { Action, Incident } from "../data/models";
import { FormatDate } from "../utils/formatters";

const FRONTEND_OVERRIDE = FRONTEND_URL;

const BASE_TEMPLATE = "../templates/email/base.html";
const INCIDENT_EMPLOYEE_TEMPLATE = "../templates/email/incident-notification-employee.html";
const INCIDENT_REPORTER_TEMPLATE = "../templates/email/incident-notification-reporter.html";
const INCIDENT_SUPERVISOR_TEMPLATE = "../templates/email/incident-notification-supervisor.html";
const TASK_ASSIGNED_TEMPLATE = "../templates/email/task-assigned-notification.html";

const INCIDENT_EMPLOYEE_COMPLETE_TEMPLATE = "../templates/email/incident-complete-employee.html";
const INCIDENT_INVITE_TEMPLATE = "../templates/email/incident-invite.html";
const INCIDENT_REVIEW_TEMPLATE = "../templates/email/incident-review.html";
const INCIDENT_REVIEW_COMPLETE_TEMPLATE = "../templates/email/incident-review-complete.html";

export class EmailService {
  transport: Transporter;

  constructor() {
    this.transport = nodemailer.createTransport(MAIL_CONFIG as TransportOptions);
  }

  async verify(): Promise<any> {
    return this.transport
      .verify()
      .then((response) => {
        return { connection: true };
      })
      .catch((error) => {
        console.log("Mailer verify error:", error);
        return { connection: false, error };
      });
  }

  async sendIncidentReporterNotification(
    recipient: { fullName: string; email: string },
    employeeName: string,
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_REPORTER_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``REPORTING_NAME``/g, employeeName ?? "");
    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_OVERRIDE}/reports/${incident.slug}`);

    console.log("-- EMAIL REPORTER INCIDENT NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "We Received Your Report", content);
  }

  async sendIncidentEmployeeNotification(
    recipient: { fullName: string; email: string },
    employeeName: string,
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_EMPLOYEE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``REPORTING_NAME``/g, employeeName ?? "");
    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_OVERRIDE}/reports/${incident.slug}`);

    console.log("-- EMAIL EMPLOYEE INCIDENT NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "We Received Your Report", content);
  }

  async sendIncidentCompleteEmployeeNotification(
    recipient: { fullName: string; email: string },
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_EMPLOYEE_COMPLETE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_OVERRIDE}/reports/${incident.slug}`);

    console.log("-- EMAIL EMPLOYEE INCIDENT COMPLETE", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "Your Report Is Complete", content);
  }

  async sendIncidentInviteNotification(
    recipient: { fullName: string; email: string },
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_INVITE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_OVERRIDE}/reports/${incident.slug}`);

    console.log("-- EMAIL INVITE INCIDENT NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "You Have Been Invited To A Report", content);
  }

  async sendIncidentReviewNotification(
    recipient: { fullName: string; email: string },
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_REVIEW_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_OVERRIDE}/reports/${incident.slug}`);

    console.log("-- EMAIL INVITE REVIEW NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "You Have Been Asked To Review A Report", content);
  }

  async sendIncidentReviewCompleteNotification(
    recipient: { fullName: string; email: string },
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_REVIEW_COMPLETE_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_OVERRIDE}/reports/${incident.slug}`);

    console.log("-- EMAIL INVITE REVIEW COMPLETE NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "Committee Review is Complete", content);
  }

  async sendIncidentSupervisorNotification(
    recipient: { fullName: string; email: string },
    employeeName: string,
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_SUPERVISOR_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``REPORTING_NAME``/g, employeeName ?? "");
    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_OVERRIDE}/reports/${incident.slug}`);

    console.log("-- EMAIL SUPERVISOR INCIDENT NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "An Incident was Reported", content);
  }

  async sendTaskAssignmentNotification(
    recipient: { fullName: string; email: string },
    action: Action,
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, TASK_ASSIGNED_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(
      /``TASK_DETAILS``/g,
      `${action.description}, due on ${FormatDate(action.due_date ?? new Date())}`
    );
    content = content.replace(
      /``INCIDENT_URL``/g,
      `${FRONTEND_OVERRIDE}/reports/${incident.slug}?action=${action.slug}`
    );

    console.log("-- TASK ASSIGNED NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "A Task Has Been Assigned to You", content);
  }

  async sendEmail(toName: string, toEmail: string, subject: string, customContent: string): Promise<any> {
    let basePath = path.join(__dirname, BASE_TEMPLATE);
    let baseContent = fs.readFileSync(basePath).toString();

    baseContent = baseContent.replace(/``CUSTOM_CONTENT``/, customContent);
    baseContent = baseContent.replace(/``APPLICATION_URL``/g, FRONTEND_OVERRIDE);
    baseContent = baseContent.replace(/``APPLICATION_NAME``/g, APPLICATION_NAME);
    baseContent = baseContent.replace(/``TO_NAME``/g, toName);
    baseContent = baseContent.replace(/``TO_EMAIL``/g, toEmail);

    let message: MailOptions = {
      from: MAIL_FROM,
      to: `"${toName}" <${toEmail}>`,
      subject: `${subject}`,
      html: baseContent,
    };

    if (!toEmail || toEmail.length == 0) {
      console.log("Not sending email to " + toName + " without an email address");
      return null;
    }

    return this.transport
      .sendMail(message)
      .then((resp) => resp)
      .catch((err) => {
        console.log("EMAILING ERROR", err);
      });
  }
}
