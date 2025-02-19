import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { isNil } from "lodash";
import { UserRole } from "../data/models";

export async function ReturnValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
}

export async function RequireAdmin(req: Request, res: Response, next: NextFunction) {
  if (isNil(req.user.roles || req.user.roles.length == 0)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (!req.user.roles.filter((role: UserRole) => role.name === "System Admin").length) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
}
