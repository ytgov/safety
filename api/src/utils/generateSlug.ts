import { Knex } from "knex";
import { DateTime } from "luxon";

export function generateSlug() {
  // return 8 random characters and numbers with a dash after 4 characters
  return (
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

export async function generateIdentifier(db: Knex) {
  const yearMax = await db("incidents")
    .whereILike("identifier", `${DateTime.utc().year}-%`)
    .max("identifier as maxVal")
    .first();

  let index = 1;

  if (yearMax && yearMax.maxVal) {
    const parts = yearMax.maxVal.split("-");
    if (parts.length === 2) {
      const numPart = parseInt(parts[1]);
      if (!isNaN(numPart)) {
        index = numPart + 1;
      }
    }
  }

  const identifier = `${DateTime.utc().year}-${index.toString().padStart(3, "0")}`;

  return identifier;
}
