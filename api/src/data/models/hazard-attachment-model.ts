export interface HazardAttachment {
  id: number;
  hazard_id: number;
  added_by_email?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file?: Buffer;
  is_deleted: boolean;
  deleted_by_user_id?: number;
  added_date: Date;
  deleted_date: Date;
}
