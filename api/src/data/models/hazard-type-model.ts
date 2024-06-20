export interface HazardType {
  id: number;
  create_user_id: number;
  searchable_user_id?: number;
  name: string;
  description?: string;
  is_searchable: boolean;
  created_at?: Date;
  searchable_on?: Date;
}
