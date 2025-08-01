import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable("data_ingestion_mappings", (table) => {
    table.unique(
      ["source_id","source_attribute","source_value","target_attribute"],
      { indexName: "uq_dim_quad" }
    );
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION fn_dim_mutual_exclusivity()
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

  await knex.raw(`
    DROP TRIGGER IF EXISTS trg_dim_mutual_exclusivity ON data_ingestion_mappings;
    CREATE TRIGGER trg_dim_mutual_exclusivity
      BEFORE INSERT OR UPDATE ON data_ingestion_mappings
      FOR EACH ROW
      EXECUTE FUNCTION fn_dim_mutual_exclusivity();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TRIGGER IF EXISTS trg_dim_mutual_exclusivity ON data_ingestion_mappings`);
  await knex.raw(`DROP FUNCTION IF EXISTS fn_dim_mutual_exclusivity()`);

await knex.schema.alterTable("data_ingestion_mappings", (table) => {
  table.dropUnique(
    ["source_id","source_attribute","source_value","target_attribute"],
    "uq_dim_quad"
  );
});
}
