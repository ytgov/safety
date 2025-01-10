import knex from "knex";
import { ActionStatus, ActionStatuses } from "../models";

export async function seed(knex: knex.Knex) {
  const items = await knex<ActionStatus>("action_statuses");

  const toInsert = [ActionStatuses.OPEN, ActionStatuses.BLOCKED, ActionStatuses.COMPLETE, ActionStatuses.READY] as Array<ActionStatus>;

  for (const item of toInsert) {
    if (items.find((d) => d.code == item.code)) continue;

    await knex("action_statuses").insert(item);
  }
}
