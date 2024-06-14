export interface HazardLog {
    id: number;
    hazard_id: number;
    old_hazard_type_id: number;
    old_description: string | null;
    old_location: string | null;
    old_location_detail: string | null;
    old_department: string | null;
    old_scope: string | null;
    old_sensitivity: string | null;
    old_status: string | null;
    old_reopen_count: number;
    new_hazard_type_id: number;
    new_description: string | null;
    new_location: string | null;
    new_location_detail: string | null;
    new_department: string | null;
    new_scope: string | null;
    new_sensitivity: string | null;
    new_status: string | null;
    new_reopen_count: number;
    changer_employee_id: string | null;
    changer_role_id: number | null;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
