import * as knex from "knex";

export async function up(knex: knex.Knex) {
  // Check database client to run appropriate SQL for Postgres or Oracle
  const client = knex.client.config.client;

  if (client === "pg" || client === "postgresql") {
    await knex.raw(`
      CREATE OR REPLACE FUNCTION check_unique_mutual_exclusivity()
      RETURNS trigger AS $$
      BEGIN
        IF (NEW.source_value IS NULL OR NEW.source_value = '') THEN
          IF EXISTS (
            SELECT 1 FROM data_ingestion_mappings
             WHERE source_id= NEW.source_id
               AND source_attribute= NEW.source_attribute
               AND source_value IS NOT NULL
               AND target_attribute= NEW.target_attribute
          ) THEN
            RAISE EXCEPTION
              'Cannot insert NULL mapping when specific mappings exist for (source_id=% , attribute=%, target=%)',
              NEW.source_id, NEW.source_attribute, NEW.target_attribute;
          END IF;
        ELSE
          IF EXISTS (
            SELECT 1 FROM data_ingestion_mappings
             WHERE source_id = NEW.source_id
               AND source_attribute= NEW.source_attribute
               AND (source_value IS NULL OR source_value = '')
               AND target_attribute= NEW.target_attribute
          ) THEN
            RAISE EXCEPTION
              'Cannot insert specific mapping when a NULL catch-all exists for (source_id=% , attribute=%, target=%)',
              NEW.source_id, NEW.source_attribute, NEW.target_attribute;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  } else if (client === "oracledb" || client === "oracle") {
    await knex.raw(`
      CREATE OR REPLACE TRIGGER trigger_check_mutual_exclusivity
      BEFORE INSERT OR UPDATE ON data_ingestion_mappings
      FOR EACH ROW
      DECLARE
        v_count NUMBER;
      BEGIN
        IF :NEW.source_value IS NULL OR :NEW.source_value = '' THEN
          SELECT COUNT(*) INTO v_count FROM data_ingestion_mappings
            WHERE source_id = :NEW.source_id
              AND source_attribute = :NEW.source_attribute
              AND source_value IS NOT NULL
              AND target_attribute = :NEW.target_attribute;
          IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20001,
              'Cannot insert NULL mapping when specific mappings exist for (source_id=' || :NEW.source_id || ', attribute=' || :NEW.source_attribute || ', target=' || :NEW.target_attribute || ')');
          END IF;
        ELSE
          SELECT COUNT(*) INTO v_count FROM data_ingestion_mappings
            WHERE source_id = :NEW.source_id
              AND source_attribute = :NEW.source_attribute
              AND (source_value IS NULL OR source_value = '')
              AND target_attribute = :NEW.target_attribute;
          IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20002,
              'Cannot insert specific mapping when a NULL catch-all exists for (source_id=' || :NEW.source_id || ', attribute=' || :NEW.source_attribute || ', target=' || :NEW.target_attribute || ')');
          END IF;
        END IF;
      END;
    `);
  } else {
    throw new Error("Unsupported database client for this migration.");
  }

  await knex.raw(`
    DROP TRIGGER IF EXISTS trigger_check_mutual_exclusivity ON data_ingestion_mappings;
    CREATE TRIGGER trigger_check_mutual_exclusivity
      BEFORE INSERT OR UPDATE ON data_ingestion_mappings
      FOR EACH ROW
      EXECUTE FUNCTION check_unique_mutual_exclusivity();
  `);
}

export async function down(knex: knex.Knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS trigger_check_mutual_exclusivity ON data_ingestion_mappings`);
  await knex.raw(`DROP FUNCTION IF EXISTS check_unique_mutual_exclusivity()`);
}
