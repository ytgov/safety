export interface RoleLog {
    id: number;
    role_id: number;
    old_name: string | null;
    old_department_code: string | null;
    old_location_code: string | null;
    old_role_type_id: number;
    old_employee_id: string;
    old_start_date: Date;
    old_end_date: Date;
    new_name: string | null;
    new_department_code: string | null;
    new_location_code: string | null;
    new_role_type_id: number;
    new_employee_id: string;
    new_start_date: Date;
    new_end_date: Date;
    changer_employee_id: string | null;
    changer_role_id: number | null;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
