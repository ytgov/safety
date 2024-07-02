import knex from "knex";
import { IncidentStatus, IncidentStatuses } from "../models";

export async function seed(knex: knex.Knex) {
  const items = await knex<IncidentStatus>("incident_statuses");

  const toInsert = [
    IncidentStatuses.OPEN,
    IncidentStatuses.IN_PROGRESS,
    IncidentStatuses.DUPLICATE,
    IncidentStatuses.NO_ACTION,
    IncidentStatuses.CLOSED,
  ] as Array<IncidentStatus>;

  for (const item of toInsert) {
    if (items.find((d) => d.code == item.code)) continue;

    await knex("incident_statuses").insert(item);
  }
}
