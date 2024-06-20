export interface HazardLog {
  id: number;
  hazard_id: number;
  old_hazard_type_id: number;
  old_description?: string;
  old_location_code?: string;
  old_location_detail?: string;
  old_department_code?: string;
  old_scope_code?: string;
  old_sensitivity_code?: string;
  old_status_code?: string;
  old_reopen_count: number;
  new_hazard_type_id: number;
  new_description?: string;
  new_location_code?: string;
  new_location_detail?: string;
  new_department_code?: string;
  new_scope_code?: string;
  new_sensitivity_code?: string;
  new_status_code?: string;
  new_reopen_count: number;
  changer_user_id?: string;
  changer_role_id?: number;
  changed_date: Date;
  log_comment: string;
  user_action: string;
}
