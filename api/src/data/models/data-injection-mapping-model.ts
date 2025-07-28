export interface DataInjectionSource {
  id?: number;
  source_id: number;
  source_attribute: string;
  source_value?: string;
  target_attribute: string;
  target_value?: string;
}
