import express, { Request, Response } from "express";
import { ReportService } from "../services";
import { DateTime } from "luxon";
import { db as knex } from "../data";

export const reportRouter = express.Router();
const db = new ReportService();

reportRouter.get("/my-reports", async (req: Request, res: Response) => {
  const list = await db.getByEmail(req.user.email);
  return res.json({ data: list });
});

reportRouter.post("/", async (req: Request, res: Response) => {
  const {} = req.body;
  req.body.email = req.user.email;
  req.body.status = "Initial Report";

  let { createDate } = req.body;

  console.log("CREATEDATE", createDate);

  let dVal = DateTime.fromISO(createDate);

  let formatted = dVal.toFormat("YYYY-MM-DD hh");

  //TIMESTAMP 'YYYY-MM-DD HH24:MI:SS.FF'

  console.log(dVal);
  console.log("ISO", dVal.toISO());
  console.log("SQL", dVal.toSQL());
  //req.body.date = dVal.toISO();

  req.body.createDate = dVal.toJSDate(); //  knex.raw("TO_TIMESTAMP()")
  delete req.body.date;

  console.log("INSERTING REPORT", req.body);

  await db.create(req.body);
  return res.json({ data: [] });
});
