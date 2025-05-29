import knex from "knex";
import { Department } from "../models";

export async function seed(knex: knex.Knex) {
  const locations = await knex<Department>("locations");

  const toInsert = [
    { code: "WHI", name: "Whitehorse" },
    { code: "DAW", name: "Dawson City" },
    { code: "WAT", name: "Watson Lake" },
    { code: "CAR", name: "Carmacks" },
    { code: "CAC", name: "Carcross" },
    { code: "HAJ", name: "Haines Junction" },
    { code: "PEC", name: "Pelly Crossing" },
    { code: "STC", name: "Stewart Crossing" },
    { code: "ROS", name: "Ross River" },
    { code: "BWL", name: "Burwash Landing" },
    { code: "DEB", name: "Destruction Bay" },
    { code: "TES", name: "Teslin" },
    { code: "OLC", name: "Old Crow" },
    { code: "ITF", name: "In the field or on the road" },
  ] as Array<Department>;

  for (const item of toInsert) {
    if (locations.find((d) => d.code == item.code)) continue;

    await knex("locations").insert(item);
  }
}
