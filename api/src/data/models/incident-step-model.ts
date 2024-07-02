export interface IncidentStep {
  id?: number;
  incident_id: number;
  step_title: string;
  order: number;
  activate_date?: Date;
  complete_date?: Date;
  complete_name?: string;
  complete_user_id?: number;
}
