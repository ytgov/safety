import * as knex from "knex";

export async function up(knex: knex.Knex) {
  await knex("action_statuses").insert({
    code: "In Progress",
    name: "In Progress",
  });

  await knex("actions").where("status_code", "Ready").update({ status_code: "In Progress" });
}

export async function down(knex: knex.Knex) {
  await knex("actions").where("status_code", "In Progress").update({ status_code: "Ready" });
}
