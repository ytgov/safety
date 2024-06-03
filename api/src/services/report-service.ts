import { DB_SCHEMA } from "../config";
import { Report } from "../data/models";
import { db } from "../data";

export class ReportService {
  async getAll(): Promise<Report[]> {
    return db.withSchema(DB_SCHEMA).from("reports");
  }

  async getByEmail(email: string): Promise<Report[]> {
    return db<Report>("reports").withSchema(DB_SCHEMA).where({ email });
  }

  async create(item: any): Promise<any> {
    return db("reports").withSchema(DB_SCHEMA).insert(item);
  }

  async update(id: number, item: any): Promise<Report> {
    return db("reports").withSchema(DB_SCHEMA).where({ id }).update(item);
  }
}
