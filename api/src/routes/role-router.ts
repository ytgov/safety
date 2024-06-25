import express, { Request, Response } from "express";
import { db as knex } from "../data";
import { isEmpty } from "lodash";
import { UserRole } from "../data/models";
import { InsertableDate } from "../utils/formatters";

export const roleRouter = express.Router();

roleRouter.get("/", async (req: Request, res: Response) => {
  const list = await knex("role_types");
  return res.json({ data: list });
});

roleRouter.post("/user/:user_id", async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const { roles } = req.body;

  knex
    .transaction(async (trx) => {
      await trx("user_roles")
        .where({ user_id: parseInt(`${user_id}`) })
        .delete();

      for (const role of roles) {
        role.create_user_id = req.user.id;
        role.start_date = InsertableDate(role.start_date);
        role.end_date = InsertableDate(role.end_date);
        role.created_at = InsertableDate(new Date().toISOString());

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
    end_date: input.end_date,
  };
}
