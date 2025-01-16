export interface Investigation {
  id: number;
  hazard_id?: number;
  incident_id?: number;
  creator_user_id?: number;
  complete_user_id?: number;
  investigation_data?: any;
}
