export interface IncidentHazardLog {
  id: number;
  incident_hazard_id: number;
  old_incident_hazard_type_code: string;
  new_incident_hazard_type_code: string;
  changer_user_id?: string;
  changer_role_id?: number;
  changed_date: Date;
  log_comment: string;
  user_action: string;
}
