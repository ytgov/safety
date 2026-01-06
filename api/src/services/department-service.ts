import { Department } from "../data/models";
import { db } from "../data/db-client";
import { UnifiedDirectoryService } from "./unified-directory-service";

export class DepartmentService {
  async determineDepartment(userEmail: string, supervisorEmail: string, location_code: string): Promise<Department> {
    const directory = new UnifiedDirectoryService();

    const userResults = await directory.searchByEmail(userEmail);
    const superResults = await directory.searchByEmail(supervisorEmail);

    if (userResults && userResults.length > 0) {
      await db("users").where({ email: userEmail }).update({ department: userResults[0].department });
      const userDepart = await db("departments").where({ name: userResults[0].department }).first<Department>();
      if (userDepart) return userDepart;
    }

    if (superResults && superResults.length > 0) {
      await db("users").where({ email: supervisorEmail }).update({ department: superResults[0].department });
      const superDepart = await db("departments").where({ name: superResults[0].department }).first<Department>();
      if (superDepart) return superDepart;
    }

    if (userEmail.endsWith("@wcb.yk.ca") || supervisorEmail.endsWith("@wcb.yk.ca")) {
      const wcbDepart = await db("departments").where({ code: "WSCB" }).first<Department>();
      if (wcbDepart) return wcbDepart;
    }

    if (userEmail.endsWith("@yesnet.yk.ca") || supervisorEmail.endsWith("@yesnet.yk.ca")) {
      const eduDepart = await db("departments").where({ code: "EDU" }).first<Department>();
      if (eduDepart) return eduDepart;
    }

    let department = await db("departments").where({ code: "UNK" }).first();
    return department;
  }
}
