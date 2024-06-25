import express, { Request, Response } from "express";
import { db as knex } from "../data";
import { isEmpty } from "lodash";
import { UserRole } from "src/data/models";
import { DB_CLIENT } from "src/config";
import { DateTime } from "luxon";

export const roleRouter = express.Router();

roleRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("role_types");
  return res.json({ data: list });
});

roleRouter.post("/user/:user_id", async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const { roles } = req.body;

  console.log("SET ROLES", user_id, roles);

  knex
    .transaction(async (trx) => {
      await trx("user_roles")
        .where({ user_id: parseInt(`${user_id}`) })
        .delete();

      for (const role of roles) {
        role.create_user_id = req.user.id;

        if (DB_CLIENT == "oracledb") {
          if (role.start_date) {
            (role as any).start_date = knex.raw(
              `TO_TIMESTAMP('${DateTime.fromISO(role.start_date).toFormat(
                "yyyy-MM-dd HH:mm:ss"
              )}', 'YYYY-MM-DD HH24:MI:SS')`
            );
          }

          if (role.end_date) {
            (role as any).end_date = knex.raw(
              `TO_TIMESTAMP('${DateTime.fromISO(role.end_date).toFormat(
                "yyyy-MM-dd HH:mm:ss"
              )}', 'YYYY-MM-DD HH24:MI:SS')`
            );
          }
        }

        if (isEmpty(role.department_code)) role.department_code = null;
        await trx("user_roles").insert(roleForInsert(role));
      }
    })
    .catch((err) => {
      console.log("ERROR IN ROLES", err);
      return res.status(500).send();
    });

  res.json({}).send();
});

function roleForInsert(input: any): UserRole {
  return {
    department_code: input.department_code,
    location_code: input.location_code,
    role_type_id: input.role_type_id,
    user_id: input.user_id,
    created_at: input.created_at,
    create_user_id: input.create_user_id,
    start_date: input.start_date,
    end_date: input.start_date,
  };
}
