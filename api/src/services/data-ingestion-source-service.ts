import { DataIngestionSource } from "../data/models";
import { db } from "../data";

export class DataIngestionSourceService {
  async getAll(): Promise<DataIngestionSource[]> {
    return db.from("data_ingestion_sources");
  }

  async getById(id: number | string): Promise<DataIngestionSource | undefined> {
    let dataIngestionSource = await db<DataIngestionSource>("data_ingestion_sources")
      .where({ id: parseInt(`${id}`) })
      .first();
    return dataIngestionSource;
  }

}
