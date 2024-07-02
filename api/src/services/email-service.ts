import nodemailer, { Transporter, TransportOptions } from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { MAIL_CONFIG, MAIL_FROM, FRONTEND_URL, APPLICATION_NAME } from "../config";
import fs from "fs";
import path from "path";
import { Incident } from "src/data/models";

const BASE_TEMPLATE = "../templates/email/base.html";
const INCIDENT_EMPLOYEE_TEMPLATE = "../templates/email/incident-notification-employee.html";
const INCIDENT_REPORTER_TEMPLATE = "../templates/email/incident-notification-reporter.html";
const INCIDENT_SUPERVISOR_TEMPLATE = "../templates/email/incident-notification-supervisor.html";

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
    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_URL}/reports/${incident.id}`);

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
    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_URL}/reports/${incident.id}`);

    console.log("-- EMAIL EMPLOYEE INCIDENT NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "We Received Your Report", content);
  }

  async sendIncidentSupervisorNotification(
    recipient: { fullName: string; email: string },
    employeeName: string,
    incident: Incident
  ): Promise<any> {
    let templatePath = path.join(__dirname, INCIDENT_SUPERVISOR_TEMPLATE);
    let content = fs.readFileSync(templatePath).toString();

    content = content.replace(/``REPORTING_NAME``/g, employeeName ?? "");
    content = content.replace(/``INCIDENT_URL``/g, `${FRONTEND_URL}/reports/${incident.id}`);

    console.log("-- EMAIL SUPERVISOR INCIDENT NOTIFICATION", recipient.email);

    await this.sendEmail(recipient.fullName, recipient.email, "An Incident was Reported", content);
  }

  async sendEmail(toName: string, toEmail: string, subject: string, customContent: string): Promise<any> {
    let basePath = path.join(__dirname, BASE_TEMPLATE);
    let baseContent = fs.readFileSync(basePath).toString();

    baseContent = baseContent.replace(/``CUSTOM_CONTENT``/, customContent);
    baseContent = baseContent.replace(/``APPLICATION_URL``/g, FRONTEND_URL);
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
