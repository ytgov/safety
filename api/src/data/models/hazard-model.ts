export interface Hazard {
  id: number;
  hazard_type_id: number;
  description?: string;
  location_code?: string;
  location_detail?: string;
  department_code?: string;
  scope_code?: string;
  sensitivity_code?: string;
  created_at: Date;
  status_code?: string;
  reopen_count: number;
}
