export interface DataIngestionMapping {
  id?: number;
  source_id: number;
  source_attribute: string;
  source_value: string | null | undefined;
  target_attribute: string;
  target_value: string | null | undefined;
}
