import * as knex from "knex";
import { generateSlug } from "src/utils/generateSlug";

export async function up(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.string("slug", 16).nullable();
  });

  const existing = await knex("actions").where("slug", null);

  for (const incident of existing) {
    await knex("actions").where("id", incident.id).update({ slug: generateSlug() });
  }

  await knex.schema.alterTable("actions", function (table) {
    table.string("slug", 16).notNullable().unique().alter();
  });
}

export async function down(knex: knex.Knex) {
  await knex.schema.alterTable("actions", function (table) {
    table.dropColumn("slug");
  });
}
