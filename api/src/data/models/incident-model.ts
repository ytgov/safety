import { Knex } from "knex";
import { IncidentStep } from "./incident-step-model";
import { Action } from "./action-model";
import { IncidentHazard } from "./incident-hazard-model";
import { Investigation } from "./investigation-model";
import { Location } from "./location-model";
import { IncidentType } from "./incident-type-model";
import { IncidentStatus } from "./incident-status-model";
import { InspectionLocation } from "./inspection-location-model";

export interface Incident {
  id?: number;
  proxy_role_type_id?: number;
  incident_type_id: number;
  sensitivity_code: string;
  status_code: string;
  department_code: string;
  reporting_person_email?: string;
  supervisor_email?: string;
  supervisor_alt_email?: string;
  proxy_user_id?: number;
  description: string;
  description_moderated?: string;
  created_at: Date | Knex.Raw<any>;
  reported_at: Date | Knex.Raw<any>;
  urgency_code: string;
  investigation_notes?: string;
  location_code?: string;
  location_detail?: string;
  slug: string;
  identifier?: string;
  inspection_location_id?: number;

  attachments?: any[];
  steps?: IncidentStep[];
  actions?: Action[];
  hazards?: IncidentHazard[];
  investigation?: Investigation;
  location?: Location;
  inspection_location?: InspectionLocation;
  type?: IncidentType;
  status?: IncidentStatus;
  access?: IncidentUserAccess[];
}

export interface IncidentUserAccess {
  incident_id: number;
  user_email: string;
  reason: string;
}
