import knex from "knex";

export async function seed(knex: knex.Knex) {
  const mappings = [
    {
      source_id: 3,
      source_attribute: "Number",
      target_attribute: "identifier",
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
      target_attribute: "description_moderated",
    },
    {
      source_id: 3,
      source_attribute: "Submitted Date",
      target_attribute: "reported_at",
    },
    {
      source_id: 3,
      source_attribute: "Incident Date",
      target_attribute: "occured_at",
    },
    {
      source_id: 3,
      source_attribute: "Location",
      target_attribute: "location_detail",
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
      target_attribute: "description",
    },
  ];

  for (const row of mappings) {
    const exists = await knex("data_ingestion_mappings").where(row).first();

    if (!exists) {
      await knex("data_ingestion_mappings").insert(row);
    }
  }
}
