import { Knex } from "knex";

export interface Hazard {
  id?: number;
  hazard_type_id: number;
  location_code?: string;
  department_code?: string;
  scope_code?: string;
  status_code?: string;
  sensitivity_code?: string;
  description?: string;
  location_detail?: string;
  created_at: Date | Knex.Raw<any>;
  reported_at: Date | Knex.Raw<any>;
  reopen_count: number;
  urgency_code: string;
  notes?: string;
  categories?: string | string[];
}
