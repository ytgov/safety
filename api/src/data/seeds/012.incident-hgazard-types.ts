import knex from "knex";
import { IncidentHazardType } from "../models";
import { IncidentHazardTypes } from "../models/incident-hazard-type-model";

export async function seed(knex: knex.Knex) {
  const locations = await knex<IncidentHazardType>("incident_hazard_types");

  const toInsert = [IncidentHazardTypes.CONTRIBUTING_FACTOR, IncidentHazardTypes.CAUSE] as Array<IncidentHazardType>;

  for (const item of toInsert) {
    if (locations.find((d) => d.code == item.code)) continue;

    await knex("incident_hazard_types").insert(item);
  }
}
