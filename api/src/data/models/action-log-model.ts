export interface ActionLog {
    id: number;
    action_id: number; // nullable or not isnt specified
    hazard_id: number;
    old_actor_employee_id: number | null;
    old_actor_role_id: number | null;
    old_due_date: Date;
    old_description: string;
    old_action_type: string;
    old_sensitivity: string | null;
    old_status: string | null;
    new_actor_employee_id: number | null;
    new_actor_role_id: number | null;
    new_due_date: Date;
    new_description: string;
    new_action_type: string;
    new_sensitivity: string | null;
    new_status: string | null;
    changer_employee_id: string | null;
    changer_role_id: number | null;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
