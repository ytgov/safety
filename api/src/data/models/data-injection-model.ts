import { Knex } from "knex";
import { IncidentType } from "./incident-type-model";
import { IncidentStatus } from "./incident-status-model";
import { Urgency } from "./urgency-model";
import { DataInjectionSource } from "./data-injection-source-model";

export interface DataInjection {
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
  reported_at?: Date | Knex.Raw<any>;
  occured_at?: Date | Knex.Raw<any>;
  created_at: Date | Knex.Raw<any>;

  type?: IncidentType;
  status?: IncidentStatus;
  urgency?: Urgency;
  source?: DataInjectionSource;
}
