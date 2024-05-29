import { DB_SCHEMA } from "../config";
import { User, User_Create, User_Update } from "../data/models";
import { db } from "../data";

export class UserService {
  async getAll(): Promise<User[]> {
    return db.withSchema(DB_SCHEMA).from("users").orderBy(["first_name", "last_name"]);
  }

  async getBySub(auth_subject: string): Promise<User | undefined> {
    let user = await db<User>("users").withSchema(DB_SCHEMA).where({ auth_subject }).first();
    return user;
  }

  async getByEmail(email: string): Promise<User | undefined> {
    if (email) {
      let user = await db<User>("users").withSchema(DB_SCHEMA).where({ email }).first();
      return user;
    }

    return undefined;
  }

  async create(item: User_Create): Promise<any> {
    return db("users").withSchema(DB_SCHEMA).insert(item);
  }

  async update(EMAIL: string, item: User_Update): Promise<User> {
    return db("users").withSchema(DB_SCHEMA).where({ EMAIL }).update(item);
  }
}
