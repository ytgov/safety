export interface IncidentLog {
    id: number;
    incident_id: number;
    old_description: string;
    old_sensitivity?: string;
    old_supervistor?: string;
    old_created_date: Date;
    old_status?: string;
    old_incident_type?: number;
    new_description: string;
    new_supervisor?: string;
    new_sensitivity?: string;
    new_created_date: Date;
    new_status?: string;
    new_incident_type?: number;
    changer_employee_id?: string;
    changer_role_id?: number;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
