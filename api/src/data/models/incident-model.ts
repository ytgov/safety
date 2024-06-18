export interface Incident {
    id: number;
    reporting_person: string | null;
    proxy_employee_id: string | null;
    proxy_role_id: number | null;
    description: string;
    sensitivity: string;
    created_at: Date;
    status: string;
    department: string;
    supervisor: string | null;
    incident_type_id: number;
}
