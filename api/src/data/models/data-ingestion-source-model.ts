export interface DataIngestionSource {
  id?: number;
  source_name: string;
  description: string;
  identifier_column_name: string;
  column_count: number;
  source_attribute_to_transform: string | null | undefined;
  target_attribute_to_transform: string | null | undefined;
}
