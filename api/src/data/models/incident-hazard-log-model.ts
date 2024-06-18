export interface IncidentHazardLog {
    id: number;
    incident_hazard_id: number;
    old_incident_hazard_type: string;
    new_incident_hazard_type: string;
    changer_employee_id: string | null;
    changer_role_id: number | null;
    changed_date: Date;
    log_comment: string;
    user_action: string;
}
