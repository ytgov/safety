import knex from "knex";

export async function seed(knex: knex.Knex) {
  const mappings = [
    {
      source_id: 1,
      source_attribute: "File ID",
      target_attribute: "identifier",
    },
    {
      source_id: 1,
      source_attribute: "File State",
      source_value: "New",
      target_attribute: "status_code",
      target_value: "Open",
    },
    {
      source_id: 1,
      source_attribute: "File State",
      source_value: "In-Progress",
      target_attribute: "status_code",
      target_value: "InProg",
    },
    {
      source_id: 1,
      source_attribute: "File State",
      source_value: "Closed",
      target_attribute: "status_code",
      target_value: "Closed",
    },
    {
      source_id: 1,
      source_attribute: "Event Date  (yyyy/mm/dd)",
      target_attribute: "occured_at",
    },
    {
      source_id: 1,
      source_attribute: "Specific Event Type(s)",
      target_attribute: "description_moderated",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Incident (minor)",
      target_attribute: "incident_type_id",
      target_value: "1",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Near Miss (serious)",
      target_attribute: "incident_type_id",
      target_value: "3",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Incident (serious)",
      target_attribute: "incident_type_id",
      target_value: "1",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Near Miss (minor)",
      target_attribute: "incident_type_id",
      target_value: "3",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Incident (minor)",
      target_attribute: "urgency_code",
      target_value: "Low",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Near Miss (serious)",
      target_attribute: "urgency_code",
      target_value: "Critical",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Near Miss (minor)",
      target_attribute: "urgency_code",
      target_value: "Low",
    },
    {
      source_id: 1,
      source_attribute: "Severity Level (Reported)",
      source_value: "Incident (serious)",
      target_attribute: "urgency_code",
      target_value: "Critical",
    },
    {
      source_id: 1,
      source_attribute: "Division (responsible for the person)",
      target_attribute: "location_detail",
    },
    {
      source_id: 1,
      source_attribute: "Branch",
      target_attribute: "location_detail",
    },
    {
      source_id: 1,
      source_attribute: "Program",
      target_attribute: "location_detail",
    },
    {
      source_id: 1,
      source_attribute: "Brief Factual Description",
      target_attribute: "description",
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
