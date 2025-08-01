import { Urgency } from "./urgency-model";
import { IncidentType } from "./incident-type-model";
import { IncidentStatus } from "./incident-status-model";
import { DataIngestionSource } from "./data-ingestion-source-model";

export interface DataIngestion {
  id?: number;
  source_id: number;
  identifier: string;
  incident_type_id: number | null;
  status_code: string | null;
  proxy_user_id: number;
  description: string | null;
  description_moderated: string | null;
  urgency_code: string | null;
  location_detail: string | null;
  reported_at: Date | null;
  occured_at: Date | null;
  created_at: Date;
}
