export interface IncidentAttachment {
  id: number;
  incident_id: number;
  added_by_email: string;
  is_deleted: boolean;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file?: Buffer;
  deleted_by_user_id?: string;
  added_date: Date;
  deleted_date: Date;
}
