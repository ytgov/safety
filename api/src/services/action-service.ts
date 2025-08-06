import { Action, Incident } from "../data/models";
import { db } from "../data/db-client";
import { Knex } from "knex";
import { isArray } from "lodash";

export class ActionService {
  async getAll(email: string, where: (query: Knex.QueryBuilder) => Knex.QueryBuilder): Promise<Action[]> {
    return db<Action>("actions")
      .modify(where)
      .leftJoin("incidents", "actions.incident_id", "incidents.id")
      .whereRaw(`"actions"."incident_id" IN (SELECT "incident_id" FROM "incident_users_view" WHERE "user_email" = ?)`, [
        email,
      ])
      .select("actions.*", "incidents.slug as incident_slug", "incidents.incident_type_id")
      .orderBy("actions.created_at", "desc");
  }
  async getCount(email: string, where: (query: Knex.QueryBuilder) => Knex.QueryBuilder): Promise<{ count: number }> {
    return db<Action>("actions").modify(where).count("* as count").first();
  }

  async getBySlug(slug: string, email: string): Promise<Action | undefined> {
    const item = await db("actions").where({ slug }).first();
    if (!item) return undefined;
    return this.getById(item.id, email);
  }

  async getById(id: number | string, email: string): Promise<Action | undefined> {
    const item = await db("actions")
      .whereRaw(`"actions"."incident_id" IN (SELECT "incident_id" FROM "incident_users_view" WHERE "user_email" = ?)`, [
        email,
      ])
      .where("actions.id", parseInt(`${id}`))
      .first();

    item.categories = item.categories ?? [];
    if (!isArray(item.categories)) item.categories = item.categories.split(",");

    return item;
  }

  async create(item: any): Promise<Action[]> {
    return db("actions").insert(item).returning("*");
  }

  async update(id: number, item: any): Promise<Action> {
    return db("actions").where({ id }).update(item);
  }
}
