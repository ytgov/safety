import knex from "knex";
import { Department } from "../models";

export async function seed(knex: knex.Knex) {
  const departments = await knex<Department>("departments");

  const toInsert = [
    { code: "PSC", name: "Public Service Commission" },
    { code: "HPW", name: "Highways & Public Works" },
    { code: "FIN", name: "Finance" },
    { code: "EMR", name: "Energy Mines & Resources" },
  ] as Array<Department>;

  for (const item of toInsert) {
    if (departments.find((d) => d.code == item.code)) continue;

    await knex("departments").insert(item);
  }
}
