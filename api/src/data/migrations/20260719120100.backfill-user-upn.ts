import * as knex from "knex";

import { UnifiedDirectoryService } from "../../services/unified-directory-service";

// Graph is rate limited, so walk the users in small concurrent batches rather
// than firing one request per user at once.
const BATCH_SIZE = 5;

export async function up(knex: knex.Knex) {
  const directory = new UnifiedDirectoryService();
  await directory.connect();

  // connect() logs and swallows auth failures. Without this check the migration
  // would "succeed" having filled in nothing, and knex would never run it again.
  if (!directory.isConnected()) {
    throw new Error(
      "Cannot backfill users.upn: failed to authenticate against Microsoft Graph. " +
        "Check AD_CLIENT_SECRET / AD_TENANT_ID (and the YESNET_* equivalents) and re-run the migration.",
    );
  }

  const users = await knex("users")
    .whereNull("upn")
    .whereNotNull("email")
    .select("id", "email");

  console.log(`-------- BACKFILL users.upn: ${users.length} user(s) ---------`);

  let matched = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    const upns = await Promise.all(
      batch.map((user) =>
        directory.getUpnByEmail(user.email).catch((err) => {
          console.log("UPN lookup failed for", user.email, err);
          return null;
        }),
      ),
    );

    for (let j = 0; j < batch.length; j++) {
      const upn = upns[j];
      if (!upn) continue;

      await knex("users").where({ id: batch[j].id }).update({ upn });
      matched++;
    }
  }

  console.log(
    `-------- BACKFILL users.upn: matched ${matched} of ${users.length} ---------`,
  );
}

export async function down(knex: knex.Knex) {
  await knex("users").update({ upn: null });
}
