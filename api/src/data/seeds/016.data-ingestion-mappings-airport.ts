import knex from "knex";

export async function seed(knex: knex.Knex) {
  const mappings = [
    {
      source_id: 2,
      source_attribute: "ID",
      target_attribute: "identifier",
    },
    {
      source_id: 2,
      source_attribute: "Date/Time Occurred",
      target_attribute: "occured_at",
    },
    {
      source_id: 2,
      source_attribute: "Category",
      target_attribute: "incident_type_id",
    },
    {
      source_id: 2,
      source_attribute: "Location",
      target_attribute: "location_detail",
    },
    {
      source_id: 2,
      source_attribute: "Summary",
      target_attribute: "description",
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

  for (const row of mappings) {
    const exists = await knex("data_ingestion_mappings").where(
      { source_id: row.source_id, 
        source_attribute: row.source_attribute, 
        source_value: row.source_value}).first();

    if (exists) {
      await knex('data_ingestion_mappings')
        .where(exists)
        .update(row);
    }

    if (!exists) {
      await knex("data_ingestion_mappings").insert(row);
    }
  }
}
