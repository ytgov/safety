export interface RoleLog {
    id: number;
    role_id: number;
    old_name?: string;
    old_department?: string;
    old_location?: string;
    old_role_type_id: number;
    old_employee_id: string;
    old_start_date: Date;
    old_end_date: Date;
    new_name?: string;
    new_department?: string;
    new_location?: string;
    new_role_type_id: number;
    new_employee_id: string;
    new_start_date: Date;
    new_end_date: Date;
    changer_employee_id?: string;
    changer_role_id?: number;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
