import knex from "knex";
import { DataIngestionMapping } from "@/data/models";

export async function seed(knex: knex.Knex) {
  const dataIngestionMappingsAttributes: DataIngestionMapping[]  = [
    {
      source_id: 2,
      source_attribute: "ID",
      source_value: null,
      target_attribute: "identifier",
      target_value: null,
    },
    {
      source_id: 2,
      source_attribute: "Date/Time Occurred",
      source_value: null,
      target_attribute: "occured_at",
      target_value: null,
    },
    {
      source_id: 2,
      source_attribute: "Location",
      source_value: null,
      target_attribute: "location_detail",
      target_value: null,
    },
    {
      source_id: 2,
      source_attribute: "Summary",
      source_value: null,
      target_attribute: "description",
      target_value: null,
    },
    {
      source_id: 2,
      source_attribute: "Status",
      source_value: "Open",
      target_attribute: "status_code",
      target_value: "Open",
    },
    {
      source_id: 2,
      source_attribute: "Status",
      source_value: "Closed",
      target_attribute: "status_code",
      target_value: "Closed",
    },
    {
      source_id: 2,
      source_attribute: "Category",
      source_value: "OH&S: Near Miss",
      target_attribute: "incident_type_id",
      target_value: "3",
    },
    {
      source_id: 2,
      source_attribute: "Category",
      source_value: "OH&S: Unsafe Act/Condition",
      target_attribute: "incident_type_id",
      target_value: "2",
    },
    {
      source_id: 2,
      source_attribute: "Category",
      source_value: "OH&S: Lost Time Injury",
      target_attribute: "incident_type_id",
      target_value: "1",
    },
    {
      source_id: 2,
      source_attribute: "Category",
      source_value: "OH&S: Minor Injury",
      target_attribute: "incident_type_id",
      target_value: "1",
    },
    {
      source_id: 2,
      source_attribute: "Severity",
      source_value: "Insignificant",
      target_attribute: "urgency_code",
      target_value: "Low",
    },
    {
      source_id: 2,
      source_attribute: "Severity",
      source_value: "Minor",
      target_attribute: "urgency_code",
      target_value: "Low",
    },
    {
      source_id: 2,
      source_attribute: "Severity",
      source_value: "Moderate",
      target_attribute: "urgency_code",
      target_value: "Medium",
    },
  ];

  for (const dataIngestionMappingsAttribute of dataIngestionMappingsAttributes) {
    const { source_id, source_attribute, source_value, target_attribute, target_value } = dataIngestionMappingsAttribute;
    const key = { source_id, source_attribute, target_attribute };
    if (dataIngestionMappingsAttribute.source_value == null) {
      await knex("data_ingestion_mappings").where(key).whereNotNull("source_value").del();
    } else {
      await knex("data_ingestion_mappings").where(key).whereNull("source_value").del();
    }

    const exists = await knex("data_ingestion_mappings")
      .where({ ...key, source_value })
      .first();

    if (exists) {
      await knex("data_ingestion_mappings").where({ id: exists.id }).update({ target_value });
    } else {
      await knex("data_ingestion_mappings").insert(dataIngestionMappingsAttribute);
    }
  }
}
