export interface IncidentLog {
    id: number;
    incident_id: number;
    old_description: string;
    old_sensitivity_code: string | null;
    old_supervistor: string | null;
    old_created_date: Date;
    old_status_code: string | null;
    old_incident_type_id: number | null;
    new_description: string;
    new_supervisor: string | null;
    new_sensitivity_code: string | null;
    new_created_date: Date;
    new_status_code: string | null;
    new_incident_type_id: number | null;
    changer_employee_id: string | null;
    changer_role_id: number | null;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
