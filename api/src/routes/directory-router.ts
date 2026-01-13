import express, { Request, Response } from "express";
import { UnifiedDirectoryService } from "../services";
import { db as knex } from "../data/db-client";

export const directoryRouter = express.Router();

const unifiedDirectory = new UnifiedDirectoryService();

directoryRouter.post(
  "/search-directory",
  async (req: Request, res: Response) => {
    let { terms } = req.body;

    const results = await unifiedDirectory.search(terms);

    return res.json({ data: results });
  }
);

directoryRouter.post(
  "/search-action-directory",
  async (req: Request, res: Response) => {
    let { terms } = req.body;
    terms = terms.toLowerCase();

    const results = await unifiedDirectory.search(terms);
    let data = results.slice();
    let yesnetResults: any[] = [];

    const parts = terms.split(" ");

    let allUsersQuery = knex("users");

    for (const part of parts) {
      allUsersQuery.whereRaw(
        `(LOWER("email") LIKE '${part}%' OR LOWER("first_name") LIKE '${part}%' OR LOWER("last_name") LIKE '${part}%')`
      );
    }

    let allUsers = await allUsersQuery;
    data.map(
      (d: any) => (d.user_id = allUsers.find((u) => u.email == d.email)?.id)
    );
    yesnetResults.map(
      (d: any) => (d.user_id = allUsers.find((u) => u.email == d.email)?.id)
    );

    const combinedData = [...data, ...yesnetResults];

    const foundEmails = combinedData.map((d: any) => d.email);
    allUsers = allUsers.filter((u) => u.is_active == true);
    allUsers = allUsers.filter((u) => !foundEmails.includes(u.email));

    for (const user of allUsers) {
      combinedData.push({
        display_name: `${user.first_name} ${user.last_name}`,
        first_name: user.first_name,
        last_name: user.last_name,
        ynet_id: user.ynet_id,
        email: user.email,
        long_name: `${user.first_name} ${user.last_name} (${user.email}) ${user.department} : ${user.title}`,
        title: user.title,
        department: user.department,
        officeLocation: user.officeLocation,
        userPrincipalName: user.userPrincipalName,
        user_id: user.id,
      });
    }

    return res.json({ data: combinedData });
  }
);

directoryRouter.post(
  "/search-action-directory-email",
  async (req: Request, res: Response) => {
    let { terms } = req.body;

    const allUsers = await knex("users").where({ email: terms });

    if (allUsers.length == 1) {
      const nonDirectoryUser = allUsers[0];

      return res.json({
        data: [
          {
            display_name: `${nonDirectoryUser.first_name} ${nonDirectoryUser.last_name}`,
            first_name: nonDirectoryUser.first_name,
            last_name: nonDirectoryUser.last_name,
            ynet_id: nonDirectoryUser.ynet_id,
            email: nonDirectoryUser.email,
            long_name: `${nonDirectoryUser.first_name} ${nonDirectoryUser.last_name} (${nonDirectoryUser.email}) ${nonDirectoryUser.department} : ${nonDirectoryUser.title}`,
            title: nonDirectoryUser.title,
            department: nonDirectoryUser.department,
            officeLocation: nonDirectoryUser.officeLocation,
            userPrincipalName: nonDirectoryUser.userPrincipalName,
            user_id: nonDirectoryUser.id,
          },
        ],
      });
    }

    const data = await unifiedDirectory.searchByEmail(terms);

    if (data.length > 0) {
      data.map(
        (d: any) => (d.user_id = allUsers.find((u) => u.email == d.email)?.id)
      );
    } else {
      const nonDirectoryUser = allUsers.find((u) => u.email == terms);

      if (nonDirectoryUser) {
        data.push({
          display_name: `${nonDirectoryUser.first_name} ${nonDirectoryUser.last_name}`,
          first_name: nonDirectoryUser.first_name,
          last_name: nonDirectoryUser.last_name,
          ynet_id: nonDirectoryUser.ynet_id,
          email: nonDirectoryUser.email,
          long_name: `${nonDirectoryUser.first_name} ${nonDirectoryUser.last_name} (${nonDirectoryUser.email}) ${nonDirectoryUser.department} : ${nonDirectoryUser.title}`,
          title: nonDirectoryUser.title,
          department: nonDirectoryUser.department,
          officeLocation: nonDirectoryUser.officeLocation,
          userPrincipalName: nonDirectoryUser.userPrincipalName,
          user_id: nonDirectoryUser.id,
        });
      }
    }

    return res.json({ data });
  }
);
