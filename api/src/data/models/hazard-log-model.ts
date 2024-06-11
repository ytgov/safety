export interface HazardLog {
    id: number;
    hazard_id: number;
    old_hazard_type_id: number;
    old_description?: string;
    old_location?: string;
    old_location_detail?: string;
    old_department?: string;
    old_scope?: string;
    old_sensitivity?: string;
    old_status?: string;
    old_reopen_count: number;
    new_hazard_type_id: number;
    new_description?: string;
    new_location?: string;
    new_location_detail?: string;
    new_department?: string;
    new_scope?: string;
    new_sensitivity?: string;
    new_status?: string;
    new_reopen_count: number;
    changer_employee_id?: string;
    changer_role_id?: number;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
