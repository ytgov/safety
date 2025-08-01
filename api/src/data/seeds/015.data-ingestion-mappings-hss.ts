import knex from "knex";

export async function seed(knex: knex.Knex) {
  const mappings = [
    {
      source_id: 1,
      source_attribute: "File ID",
      source_value: null,
      target_attribute: "identifier",
      target_value: null,
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
      source_value: null,
      target_attribute: "occured_at",
      target_value: null,
    },
    {
      source_id: 1,
      source_attribute: "Specific Event Type(s)",
      source_value: null,
      target_attribute: "description_moderated",
      target_value: null,
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
      source_value: null,
      target_attribute: "location_detail",
      target_value: null,
    },
    {
      source_id: 1,
      source_attribute: "Branch",
      source_value: null,
      target_attribute: "location_detail",
      target_value: null,
    },
    {
      source_id: 1,
      source_attribute: "Program",
      source_value: null,
      target_attribute: "location_detail",
      target_value: null,
    },
    {
      source_id: 1,
      source_attribute: "Brief Factual Description",
      source_value: null,
      target_attribute: "description",
      target_value: null,
    },
  ];

  for (const row of mappings) {
    const { source_id, source_attribute, source_value, target_attribute, target_value } = row;
    const key = { source_id, source_attribute, target_attribute };
    if (row.source_value == null) {
      await knex("data_ingestion_mappings")
        .where(key)
        .whereNotNull('source_value')
        .del();
    } else {
      await knex("data_ingestion_mappings")
        .where(key)
        .whereNull('source_value')
        .del();
    }

    const exists = await knex("data_ingestion_mappings")
      .where({ ...key, source_value })
      .first();

    if (exists) {
      await knex("data_ingestion_mappings")
        .where({ id: exists.id })
        .update({ target_value });
    } else {
      await knex("data_ingestion_mappings").insert(row);
    }
  }

}
