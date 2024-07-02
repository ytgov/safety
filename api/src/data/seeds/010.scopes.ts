import knex from "knex";
import { Scope, Scopes } from "../models";

export async function seed(knex: knex.Knex) {
  const items = await knex<Scope>("scopes");

  const toInsert = [Scopes.DEFAULT] as Array<Scope>;

  for (const item of toInsert) {
    if (items.find((d) => d.code == item.code)) continue;

    await knex("scopes").insert(item);
  }
}
