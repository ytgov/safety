export interface ActionLog {
    action_log_id: number;
    action_id: number; // nullable or not isnt specified
    hazard_id: number;
    old_actor_employee_id?: number;
    old_actor_role_id?: number;
    old_due_date: Date;
    old_description: string;
    old_action_type: string;
    old_sensitivity?: string;
    old_status?: string;
    new_actor_employee_id?: number;
    new_actor_role_id?: number;
    new_due_date: Date;
    new_description: string;
    new_action_type: string;
    new_sensitivity?: string;
    new_status?: string;
    changer_employee_id?: string;
    changer_role_id?: number;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
