import { Knex } from "knex";

export interface IncidentStep {
  id?: number;
  incident_id: number;
  step_title: string;
  order: number;
  activate_date?: Date | Knex.Raw<any>;
  complete_date?: Date | Knex.Raw<any>;
  complete_name?: string;
  complete_user_id?: number;
}
