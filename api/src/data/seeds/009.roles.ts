import knex from "knex";
import { RoleType } from "../models";

export async function seed(knex: knex.Knex) {
  const roles = await knex<RoleType>("role_types");
  
  const toInsert = [
    { name: "System Admin", permissions: 1, description: "System Admin" },
    { name: "Property Management", permissions: 1, description: "Property Management" },
    { name: "Inspector", permissions: 1, description: "Inspector" },
    { name: "Safety Practitioner", permissions: 1, description: "Safety Practitioner" },
    { name: "Safety Authority", permissions: 1, description: "Safety Authority" },

  ] as Array<RoleType>;

  for (const item of toInsert) {
    if (roles.find((d) => d.name == item.name)) continue;

    await knex("role_types").insert(item);
  }
}
