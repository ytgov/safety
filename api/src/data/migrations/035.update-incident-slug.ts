import * as knex from "knex";
import { generateSlug } from "../../utils/generateSlug";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.string("slug", 16).nullable();
  });

  const existing = await knex("incidents").where("slug", null);

  for (const incident of existing) {
    await knex("incidents").where("id", incident.id).update({ slug: generateSlug() });
  }

  await knex.schema.alterTable("incidents", function (table) {
    table.string("slug", 16).notNullable().unique().alter();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("incidents", function (table) {
    table.dropColumn("slug");
  });
}
