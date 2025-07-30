export interface DataInjectionSource {
  id?: number;
  source_name: string;
  description?: string;
  identifier_column_name: string;
  column_count: number;
  source_attribute_to_transform?: string;
  target_attribute_to_transform?: string; 
}
