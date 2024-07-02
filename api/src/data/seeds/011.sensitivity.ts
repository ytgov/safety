import knex from "knex";
import { Sensitivity, SensitivityLevels } from "../models";

export async function seed(knex: knex.Knex) {
  const locations = await knex<Sensitivity>("sensitivities");

  const toInsert = [
    SensitivityLevels.NOT_SENSITIVE,
    SensitivityLevels.SENSITIVE,
    SensitivityLevels.HIGHLY_SENSITIVE,
  ] as Array<Sensitivity>;

  for (const item of toInsert) {
    if (locations.find((d) => d.code == item.code)) continue;

    await knex("sensitivities").insert(item);
  }
}
