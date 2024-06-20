export interface Incident {
  id: number;
  proxy_role_type_id?: number;
  incident_type_id: number;
  sensitivity_code: string;
  status_code: string;
  department_code: string;
  reporting_person_email?: string;
  supervisor_email?: string;
  proxy_user_id?: string;
  description: string;
  created_at: Date;
}
