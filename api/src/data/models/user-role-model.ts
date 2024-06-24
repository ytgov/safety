export interface UserRole {
  id?: number;
  name?: string;
  department_code?: string;
  location_code?: string;
  role_type_id: number;
  user_id: string;
  created_at: Date;
  create_user_id: number;
  start_date: Date;
  end_date?: Date;
}
