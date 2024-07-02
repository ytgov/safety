import knex from "knex";
import { ActionType, ActionTypes } from "../models/action-type-model";

export async function seed(knex: knex.Knex) {
  const items = await knex<ActionType>("action_types");

  const toInsert = [ActionTypes.SYSTEM_GENERATED, ActionTypes.USER_GENERATED] as Array<ActionType>;

  for (const item of toInsert) {
    if (items.find((d) => d.code == item.code)) continue;

    await knex("action_types").insert(item);
  }
}
