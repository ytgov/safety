import { Department } from "../data/models";
import { db } from "../data";
import { DirectoryService } from "./directory-service";

export class DepartmentService {
  async determineDepartment(userEmail: string, supervisorEmail: string, location_code: string): Promise<Department> {
    const directory = new DirectoryService();
    await directory.connect();

    const userResults = await directory.searchByEmail(userEmail);
    const superResults = await directory.searchByEmail(supervisorEmail);

    let department = await db("departments").first();

    if (userResults && userResults.length > 0) {
      await db("users").where({ email: userEmail }).update({ department: userResults[0].department });
      const userDepart = await db("departments").where({ name: userResults[0].department }).first<Department>();
      if (userDepart) department = userDepart;
    }

    if (superResults && superResults.length > 0) {
      await db("users").where({ email: supervisorEmail }).update({ department: superResults[0].department });
      const superDepart = await db("departments").where({ name: superResults[0].department }).first<Department>();
      if (superDepart) department = superDepart;
    }

    return department;
  }
}
