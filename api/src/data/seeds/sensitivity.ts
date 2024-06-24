import knex from "knex";
import { Sensitivity } from "../models";

export async function seed(knex: knex.Knex) {
  const locations = await knex<Sensitivity>("sensitivities");

  const toInsert = [
    { code: "0", name: "Not Sensitive" },
    { code: "1", name: "Sensitive" },
    { code: "2", name: "Highly Sensitive" },
  ] as Array<Sensitivity>;

  for (const item of toInsert) {
    if (locations.find((d) => d.code == item.code)) continue;

    await knex("sensitivities").insert(item);
  }
}
