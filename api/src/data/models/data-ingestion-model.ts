import { Urgency } from "./urgency-model";
import { IncidentType } from "./incident-type-model";
import { IncidentStatus } from "./incident-status-model";
import { DataIngestionSource } from "./data-ingestion-source-model";

export interface DataIngestion {
  id?: number;
  source_id: number;
  identifier: string;
  incident_type_id: number;
  status_code: string;
  proxy_user_id: number;
  description?: string;
  description_moderated?: string;
  urgency_code?: string;
  location_detail?: string;
  reported_at?: Date
  occured_at?: Date
  created_at: Date

  type?: IncidentType;
  status?: IncidentStatus;
  urgency?: Urgency;
  source?: DataIngestionSource;
}
