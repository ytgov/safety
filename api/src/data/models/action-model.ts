export interface Action {
  id?: number;
  hazard_id?: number;
  incident_id?: number;
  creator_user_id?: number;
  creator_role_type_id?: number;
  actor_user_id?: number;
  actor_user_email?: string;
  actor_role_type_id?: number;
  created_at: Date;
  modified_at?: Date;
  due_date?: Date;
  description: string;
  action_type_code: string;
  sensitivity_code?: string;
  status_code?: string;
  notes?: string;
}
