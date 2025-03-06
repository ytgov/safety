import { Action, Incident } from "../data/models";
import { db } from "../data";
import { Knex } from "knex";

export class ActionService {
  async getAll(email: string, where: (query: Knex.QueryBuilder) => Knex.QueryBuilder): Promise<Action[]> {
    return db<Action>("actions").modify(where).orderBy("actions.created_at", "desc");
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
      .where("actions.id", parseInt(`${id}`))
      .first();
    return item;
  }

  async create(item: any): Promise<Action[]> {
    return db("actions").insert(item).returning("*");
  }

  async update(id: number, item: any): Promise<Action> {
    return db("actions").where({ id }).update(item);
  }
}
