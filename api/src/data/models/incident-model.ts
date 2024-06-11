export interface Incident {
    id: number;
    reporting_person?: string;
    proxy_employee_id?: string;
    proxy_role_id?: number;
    description: string;
    sensitivity: string;
    created_at: Date;
    status: string;
    department: string;
    supervisor?: string;
    incident_type: number;
}
