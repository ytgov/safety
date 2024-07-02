import knex from "knex";
import { HazardType, HazardTypes } from "../models";

export async function seed(knex: knex.Knex) {
  const items = await knex<HazardType>("hazard_types");

  const toInsert = [
    HazardTypes.ENVIRONMENTAL,
    HazardTypes.PHYSICAL,
    HazardTypes.PERSONAL,
    HazardTypes.JOB,
  ] as Array<HazardType>;

  for (const item of toInsert) {
    if (items.find((d) => d.name == item.name)) continue;

    await knex("hazard_types").insert(item);
  }
}
