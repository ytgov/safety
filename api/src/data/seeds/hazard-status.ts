import knex from "knex";
import { HazardStatus } from "../models";

export async function seed(knex: knex.Knex) {
  const items = await knex<HazardStatus>("hazard_statuses");

  const toInsert = [
    { code: "REP", name: "Initial Report" },
    { code: "SUP", name: "Supervisor Review" },
    { code: "OPEN", name: "Open" },
    { code: "INV", name: "Investigated" },
    { code: "ACT", name: "Actioned" },
    { code: "ELEV", name: "Elevated" },
    { code: "VERIFY", name: "Verified" },
    { code: "APP", name: "Approved" },
    { code: "CLOSE", name: "Closed" },
  ] as Array<HazardStatus>;

  for (const item of toInsert) {
    if (items.find((d) => d.code == item.code)) continue;

    await knex("hazard_statuses").insert(item);
  }
}
