import knex from "knex";
import { HazardStatus, HazardStatuses } from "../models";

export async function seed(knex: knex.Knex) {
  const items = await knex<HazardStatus>("hazard_statuses");

  const toInsert = [
    HazardStatuses.OPEN,
    HazardStatuses.IN_PROGRESS,
    HazardStatuses.DUPLICATE,
    HazardStatuses.NO_ACTION,
    HazardStatuses.REMEDIATED,
  ] as Array<HazardStatus>;

  for (const item of toInsert) {
    if (items.find((d) => d.code == item.code)) continue;

    await knex("hazard_statuses").insert(item);
  }
}
