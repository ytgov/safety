import knex from "knex";
import { IncidentStatus } from "../models";

export async function seed(knex: knex.Knex) {
  const items = await knex<IncidentStatus>("incident_statuses");

  const toInsert = [
    { code: "REP", name: "Initial Report" },
    { code: "SUP", name: "Supervisor Review" },
    { code: "OPEN", name: "Open" },
    { code: "INV", name: "Investigated" },
    { code: "ACT", name: "Actioned" },
    { code: "ELEV", name: "Elevated" },
    { code: "VERIFY", name: "Verified" },
    { code: "APP", name: "Approved" },
    { code: "CLOSE", name: "Closed" },
  ] as Array<IncidentStatus>;

  for (const item of toInsert) {
    if (items.find((d) => d.code == item.code)) continue;

    await knex("incident_statuses").insert(item);
  }
}
