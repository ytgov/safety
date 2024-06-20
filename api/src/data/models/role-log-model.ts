export interface RoleLog {
  id: number;
  user_roles_id: number;
  old_name?: string;
  old_department_code?: string;
  old_location_code?: string;
  old_role_type_id: number;
  old_user_id: string;
  old_start_date: Date;
  old_end_date: Date;
  new_name?: string;
  new_department_code?: string;
  new_location_code?: string;
  new_role_type_id: number;
  new_user_id: string;
  new_start_date: Date;
  new_end_date: Date;
  changer_user_id?: string;
  changer_role_id?: number;
  changed_date: Date;
  log_comment: string;
  user_action: string;
}
