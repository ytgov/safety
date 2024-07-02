import knex from "knex";
import { Department } from "../models";

export async function seed(knex: knex.Knex) {
  const locations = await knex<Department>("locations");

  const toInsert = [
    { code: "MAB", name: "Main Admin Building" },
    { code: "9010", name: "9010 Quartz Road" },
    { code: "Tourism", name: "Tourism Building" },
  ] as Array<Department>;

  for (const item of toInsert) {
    if (locations.find((d) => d.code == item.code)) continue;

    await knex("locations").insert(item);
  }
}
