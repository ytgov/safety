import { db } from "../data";

export class RoleService {
  getRolesForUser(user_id: number) {
    return db("user_roles")
      .innerJoin("role_types", "role_types.id", "user_roles.role_type_id")
      .where({ user_id })
      .select(
        "user_roles.id",
        "user_roles.department_code",
        "user_roles.location_code",
        "user_roles.role_type_id",
        "user_roles.user_id",
        "user_roles.created_at",
        "user_roles.create_user_id",
        "user_roles.start_date",
        "user_roles.end_date",
        "role_types.name",
        "role_types.permissions",
        "role_types.description"
      );
  }
}
