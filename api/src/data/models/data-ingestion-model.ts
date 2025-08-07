export interface DataIngestion {
  id?: number;
  source_id: number;
  identifier: string;
  incident_type_id: number | null | undefined;
  status_code: string | null | undefined;
  proxy_user_id: number;
  description: string | null | undefined;
  description_moderated: string | null | undefined;
  urgency_code: string | null | undefined;
  location_detail: string | null | undefined;
  reported_at: Date | null | undefined;
  occured_at: Date | null | undefined;
  created_at: Date;
}

export const dateFields: (keyof DataIngestion)[] = ["reported_at", "occured_at", "created_at"];
