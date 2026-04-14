import { Request, Response } from "express";

export async function doHealthCheck(req: Request, res: Response) {
    res.status(200).json({ status: "ok" });
}
