import { Department } from "../data/models";
import { db } from "../data/db-client";
import { UnifiedDirectoryService } from "./unified-directory-service";

export class DepartmentService {
  async determineDepartment(
    emailArray: string[],
    location_code: string,
  ): Promise<Department> {
    for (const email of emailArray) {
      const department = await this.findMatchByEmail(email);
      if (department) return department;
    }

    let department = await db("departments")
      .where({ code: "UNK" })
      .first<Department>();

    return department;
  }

  async findMatchByEmail(email: string): Promise<Department | null> {
    const directory = new UnifiedDirectoryService();
    const userResults = await directory.searchByEmail(email);

    if (userResults && userResults.length == 1) {
      await db("users")
        .where({ email })
        .update({ department: userResults[0].department });

      const userDepart = await db("departments")
        .where({ name: userResults[0].department })
        .first<Department>();
      if (userDepart) return userDepart;

      const depart = await db("departments")
        .where({ name: userResults[0].department })
        .first<Department>();
      if (depart) return depart;
    }

    if (email.endsWith("@wcb.yk.ca")) {
      const wcbDepart = await db("departments")
        .where({ code: "WSCB" })
        .first<Department>();
      if (wcbDepart) return wcbDepart;
    }

    if (email.endsWith("@yesnet.yk.ca")) {
      const eduDepart = await db("departments")
        .where({ code: "EDU" })
        .first<Department>();
      if (eduDepart) return eduDepart;
    }

    return null;
  }
}
