export interface Action {
    action_id: number;
    hazard_id: number;
    creator_employee_id?: number;
    creator_role_id?: number;
    actor_employee_id?: number;
    actor_role_id?: number;
    created_date: Date;
    modified_date?: Date;
    due_date?: Date;
    description: string;
    action_type: string;
    sensitivity?: string;
    status?: string;
}
