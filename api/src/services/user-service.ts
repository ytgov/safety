import { User, User_Create, User_Update } from "../data/models";
import { RoleService } from "./role-service";
import { db } from "../data";

const roleService = new RoleService();

export class UserService {
  async getAll(): Promise<User[]> {
    return db.from("users").orderBy(["first_name", "last_name"]);
  }

  async getBySub(auth_subject: string): Promise<User | undefined> {
    let user = await db<User>("users").where({ auth_subject }).first();
    if (user) user.roles = await roleService.getRolesForUser(user.id);
    return user;
  }

  async getById(id: number | string): Promise<User | undefined> {
    let user = await db<User>("users")
      .where({ id: parseInt(`${id}`) })
      .first();
    if (user) user.roles = await roleService.getRolesForUser(user.id);
    return user;
  }

  async getByEmail(email: string): Promise<User | undefined> {
    if (email) {
      let user = await db<User>("users").whereRaw(`LOWER("email") = '${email.toLowerCase()}'`).first();
      if (user) user.roles = await roleService.getRolesForUser(user.id);
      return user;
    }

    return undefined;
  }

  async create(item: User_Create): Promise<any> {
    return db("users").insert(item).returning("*");
  }

  async update(id: number | string, item: User_Update | Partial<User_Update>): Promise<User> {
    return db("users")
      .where({ id: parseInt(`${id}`) })
      .update(item);
  }

  async updateByEmail(email: string, item: User_Update): Promise<User> {
    return db("users").where({ email }).update(item);
  }
}
