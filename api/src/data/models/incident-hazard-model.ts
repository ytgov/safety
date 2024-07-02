import { Hazard } from "./hazard-model";
import { Incident } from "./incident-model";

export interface IncidentHazard {
  id: number;
  incident_id: number;
  hazard_id: number;
  incident_hazard_type_code: string;
  priority_order: number;

  incident?: Incident;
  hazard?: Hazard;
}
