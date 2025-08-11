import knex from "knex";
import { DataIngestionMapping } from "@/data/models";

export async function seed(knex: knex.Knex) {
  const dataIngestionMappingsAttributes: DataIngestionMapping[] = [
    {
      source_id: 3,
      source_attribute: "Number",
      source_value: null,
      target_attribute: "identifier",
      target_value: null,
    },
    {
      source_id: 3,
      source_attribute: "Type",
      source_value: "Incident",
      target_attribute: "incident_type_id",
      target_value: "1",
    },
    {
      source_id: 3,
      source_attribute: "Type",
      source_value: "Near Miss",
      target_attribute: "incident_type_id",
      target_value: "3",
    },
    {
      source_id: 3,
      source_attribute: "Tag",
      source_value: null,
      target_attribute: "description_moderated",
      target_value: null,
    },
    {
      source_id: 3,
      source_attribute: "Submitted Date",
      source_value: null,
      target_attribute: "reported_at",
      target_value: null,
    },
    {
      source_id: 3,
      source_attribute: "Incident Date",
      source_value: null,
      target_attribute: "occured_at",
      target_value: null,
    },
    {
      source_id: 3,
      source_attribute: "Location",
      source_value: null,
      target_attribute: "location_detail",
      target_value: null,
    },
    {
      source_id: 3,
      source_attribute: "Status",
      source_value: "Open",
      target_attribute: "status_code",
      target_value: "Open",
    },
    {
      source_id: 3,
      source_attribute: "Status",
      source_value: "Closed",
      target_attribute: "status_code",
      target_value: "Closed",
    },
    {
      source_id: 3,
      source_attribute: "Description",
      source_value: null,
      target_attribute: "description",
      target_value: null,
    },
  ];

  for (const dataIngestionMappingsAttribute of dataIngestionMappingsAttributes) {
    const { source_id, source_attribute, source_value, target_attribute, target_value } =
      dataIngestionMappingsAttribute;

    const existingIds = await knex("data_ingestion_mappings")
      .where({ source_id, source_attribute, target_attribute })
      .andWhere((queryBuilder) => {
        if (source_value == null || source_value === "") {
          queryBuilder.whereNull("source_value");
        } else {
          queryBuilder.where("source_value", source_value);
        }
      })
      .select("id");

    const ids = existingIds.map((existing) => existing.id);

    if (ids.length != 0) {
      await knex("data_ingestion_mappings").whereIn("id", ids).update({ target_value });
    } else {
      await knex("data_ingestion_mappings").insert(dataIngestionMappingsAttribute);
    }
  }
}
