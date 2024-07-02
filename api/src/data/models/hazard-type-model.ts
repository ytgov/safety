import { Urgencies } from "./urgency-model";

export interface HazardType {
  id?: number;
  name: string;
  description?: string;
  default_urgency_code?: string;
}

// This list matches the migration - changes should be made in both or
export class HazardTypes {
  static ENVIRONMENTAL = { name: "Environ", default_urgency_code: Urgencies.MEDIUM.code } as HazardType;
  static PHYSICAL = { name: "Phys", default_urgency_code: Urgencies.HIGH.code } as HazardType;
  static PERSONAL = { name: "Pers", default_urgency_code: Urgencies.HIGH.code } as HazardType;
  static JOB = { name: "Job", default_urgency_code: Urgencies.LOW.code } as HazardType;
}
