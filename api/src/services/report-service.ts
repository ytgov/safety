import { DB_SCHEMA } from "../config";
import { Report } from "../data/models";
import { db } from "../data";

export class ReportService {
  async getAll(): Promise<Report[]> {
    return db.from("reports");
  }

  async getByEmail(email: string): Promise<Report[]> {
    return db<Report>("reports").where({ email });
  }

  async create(item: any): Promise<any> {
    return db("reports").insert(item);
  }

  async update(id: number, item: any): Promise<Report> {
    return db("reports").where({ id }).update(item);
  }
}
