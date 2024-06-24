import knex from "knex";
import { Department, IncidentType } from "../models";

export async function seed(knex: knex.Knex) {
  const locations = await knex<IncidentType>("incident_types");

  const toInsert = [
    { name: "incident", description: "Incident" },
    { name: "hazard", description: "Hazard" },
    { name: "noloss", description: "No Loss Incident (near miss)" },
    { name: "refusal", description: "Work Refusal" },
    { name: "dontknow", description: "Uncategoried" },
  ] as Array<IncidentType>;

  for (const item of toInsert) {
    if (locations.find((d) => d.name == item.name)) continue;

    await knex("incident_types").insert(item);
  }
}
