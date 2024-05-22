import { DB_SCHEMA, DB_USER_TABLE } from "../config";
import { User, User_Create, User_Update } from "../data/models";
import { db } from "../data";

export class UserService {
  async getAll(): Promise<User[]> {
    return db.withSchema(DB_SCHEMA).from(DB_USER_TABLE).orderBy(["FIRST_NAME", "LAST_NAME"]);
  }

  async getBySub(USER_ID: string): Promise<User | undefined> {
    let user = await db<User>(DB_USER_TABLE).withSchema(DB_SCHEMA).where({ USER_ID }).first();
    return user;
  }

  async getByEmail(EMAIL: string): Promise<User | undefined> {
    if (EMAIL) {
      let user = await db<User>(DB_USER_TABLE).withSchema(DB_SCHEMA).where({ EMAIL }).first();
      return user;
    }

    return undefined;
  }

  async create(item: User_Create): Promise<any> {
    return db(DB_USER_TABLE).withSchema(DB_SCHEMA).insert(item);
  }

  async update(EMAIL: string, item: User_Update): Promise<User> {
    return db(DB_USER_TABLE).withSchema(DB_SCHEMA).where({ EMAIL }).update(item);
  }

  async getSurveysByEmail(EMAIL: string) {
    let lines = await db("SURVEY_USER").withSchema(DB_SCHEMA).where({ EMAIL }).select("SID");
    return lines.map((s) => s.SID);
  }

  async clearSurveysByEmail(EMAIL: string) {
    return db("SURVEY_USER").withSchema(DB_SCHEMA).where({ EMAIL }).delete();
  }

  async setSurveysByEmail(EMAIL: string, surveys: number[]) {
    for (let SID of surveys) {
      await db("SURVEY_USER").withSchema(DB_SCHEMA).insert({ EMAIL, SID });
    }
  }
}
