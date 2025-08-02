export enum DataIngestionSourceNames {
  RL6 = "RL6",
  VORTEX = "Vortex",
  WORKHUB = "Workhub",
}

export interface DataIngestionSource {
  id?: number;
  source_name: DataIngestionSourceNames;
  description: string;
  identifier_column_name: string;
  column_count: number;
  source_attribute_to_transform: string | null | undefined;
  target_attribute_to_transform: string | null | undefined;
}
