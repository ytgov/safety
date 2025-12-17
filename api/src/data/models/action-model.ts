import { ActionStatus } from "./action-status-model";
import { ActionType } from "./action-type-model";

export interface Action {
  id?: number;
  slug: string;
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
  complete_date?: Date;
  complete_name?: string;
  complete_user_id?: number;
  hazard_review: number;
  categories?: string | string[];
  title?: string | null;

  is_committee_task?: number;
  committee_supervisor_response?: string;
  committee_task_rationale?: string;
  comments?: string;

  type?: ActionType;
  status?: ActionStatus;
  actor_display_name?: string;
}
