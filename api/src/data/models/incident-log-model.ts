export interface IncidentLog {
  id: number;
  incident_id: number;
  old_description: string;
  old_sensitivity_code?: string;
  old_supervisor?: string;
  old_created_date: Date;
  old_status_code?: string;
  old_incident_type_id?: number;
  new_description: string;
  new_supervisor?: string;
  new_sensitivity_code?: string;
  new_created_date: Date;
  new_status_code?: string;
  new_incident_type_id?: number;
  changer_user_id?: string;
  changer_role_id?: number;
  changed_date: Date;
  log_comment: string;
  user_action: string;
}
