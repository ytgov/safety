import migrator from "../data/migrator";
import { db } from "../data/db-client";

async function main() {
  await migrator.migrateLatest();
  console.log("Migrations complete");
}

main()
  .then(() => db.destroy())
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error("Migration failed:", err);
    await db.destroy().catch(() => {});
    process.exit(1);
  });
