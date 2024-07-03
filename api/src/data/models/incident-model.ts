import { Knex } from "knex";
import { IncidentStep } from "./incident-step-model";
import { Action } from "./action-model";
import { IncidentHazard } from "./incident-hazard-model";

export interface Incident {
  id?: number;
  proxy_role_type_id?: number;
  incident_type_id: number;
  sensitivity_code: string;
  status_code: string;
  department_code: string;
  reporting_person_email?: string;
  supervisor_email?: string;
  proxy_user_id?: string;
  description: string;
  created_at: Date | Knex.Raw<any>;
  reported_at: Date | Knex.Raw<any>;
  urgency_code: string;
  investigation_notes?: string;

  attachments?: any[];
  steps?: IncidentStep[];
  actions?: Action[];
  hazards?: IncidentHazard[];
}
