import knex from "knex";
import { Department, Urgencies } from "../models";

export async function seed(knex: knex.Knex) {
  const locations = await knex<Department>("urgencies");

  const toInsert = [Urgencies.LOW, Urgencies.MEDIUM, Urgencies.HIGH] as Array<Department>;

  for (const item of toInsert) {
    if (locations.find((d) => d.code == item.code)) continue;

    await knex("urgencies").insert(item);
  }
}
