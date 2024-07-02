export interface IncidentHazardType {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class IncidentHazardTypes {
  static CONTRIBUTING_FACTOR = { code: "Contrib", name: "Contributing Factor" } as IncidentHazardType;
  static CAUSE = { code: "Cause", name: "Cause" } as IncidentHazardType;
}
