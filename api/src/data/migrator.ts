import express, { Request, Response } from "express";
import { join } from "path";

import { NODE_ENV } from "../config";
import { db } from "./";

export class Migrator {
  readonly migrationRouter;

  constructor() {
    this.migrationRouter = express.Router();

    this.migrationRouter.get("/", async (_req: Request, res: Response) => {
      return res.json({ data: await this.listMigrations() });
    });

    this.migrationRouter.get("/up", async (_req: Request, res: Response) => {
      try {
        await this.migrateUp();
      } catch (err) {
        console.error(err);
      }
      return res.json({ data: await migrator.listMigrations() });
    });

    this.migrationRouter.get("/down", async (_req: Request, res: Response) => {
      try {
        await this.migrateDown();
      } catch (err) {
        console.error(err);
      }
      return res.json({ data: await this.listMigrations() });
    });

    this.migrationRouter.get("/seed/all", async (req: Request, res: Response) => {
      try {
        const result = await this.seedAll();
        return res.json({ data: result });
      } catch (err) {
        console.error(err);
      }
      res.json({ data: "Seeding Failed" });
    });

    this.migrationRouter.get("/seed/:specific", async (req: Request, res: Response) => {
      try {
        const { specific } = req.params;
        const result = await this.seedUp(specific);
        return res.json({ data: result });
      } catch (err) {
        console.error(err);
      }
      res.json({ data: "Seeding Failed" });
    });
  }

  listMigrations() {
    return db.migrate.list({ directory: join(__dirname, "migrations") });
  }

  async migrateUp() {
    console.log("-------- MIGRATE UP ---------");
    return db.migrate.up({ directory: join(__dirname, "migrations") });
  }

  async migrateDown() {
    console.log("-------- MIGRATE DOWN ---------");
    return db.migrate.down({ directory: join(__dirname, "migrations") });
  }

  async migrateLatest() {
    console.log("-------- MIGRATE LATEST ---------");
    return db.migrate.latest({ directory: join(__dirname, "migrations") });
  }

  async seedUp(specific: string) {
    console.log(`-------- SEED ${specific} ---------`);
    return db.seed.run({ specific, directory: join(__dirname, "seeds") });
  }

  async seedAll() {
    console.log(`-------- SEED ALL ---------`);
    return db.seed.run({ directory: join(__dirname, "seeds") });
  }
}
const migrator = new Migrator();

export default migrator;
