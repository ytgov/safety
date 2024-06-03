import express, { Request, Response } from "express";
import { ReportService } from "../services";
import { DateTime } from "luxon";

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

  let { date } = req.body;

  console.log("DATE", date);

  let dVal = DateTime.fromISO(date);

  console.log(dVal);
  console.log(dVal.toISOTime());
  req.body.date = dVal.toJSDate();

  await db.create(req.body);
  return res.json({ data: [] });
});
