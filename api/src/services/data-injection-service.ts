import { db } from "../data";

export class DataInjectionSourceService {
  getDataInjectionSourceService() {
    return db("data_injection_sources")
      .select("id", "source_name", "description");
  }
}
