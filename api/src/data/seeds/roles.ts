import knex from "knex";
import { RoleType } from "../models";

export async function seed(knex: knex.Knex) {
  const roles = await knex<RoleType>("role_types");
  
  const toInsert = [
    { name: "System Admin", permissions: 1, description: "System Admin" },
    { name: "JOHSC", permissions: 1, description: "Joint Health and Safety Committee" },
    { name: "SMT", permissions: 1, description: "Safety Management Team" },
    { name: "RWO", permissions: 1, description: "Respectful Workplace Office" },
    { name: "Property Management", permissions: 1, description: "Property Management" },
    { name: "Monitor", permissions: 1, description: "Monitor" },
  ] as Array<RoleType>;

  for (const item of toInsert) {
    if (roles.find((d) => d.name == item.name)) continue;

    await knex("role_types").insert(item);
  }
}
