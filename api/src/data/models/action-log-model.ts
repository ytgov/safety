export interface ActionLog {
  id: number;
  action_id: number;
  hazard_id: number;
  old_actor_user_id?: number;
  old_actor_role_id?: number;
  old_due_date: Date;
  old_description: string;
  old_action_type_code: string;
  old_sensitivity_code?: string;
  old_status_code?: string;
  new_actor_user_id?: number;
  new_actor_role_id?: number;
  new_due_date: Date;
  new_description: string;
  new_action_type_code: string;
  new_sensitivity_code?: string;
  new_status_code?: string;
  changer_user_id?: string;
  changer_role_id?: number;
  changed_date: Date;
  log_comment: string;
  user_action: string;
}
