export interface Urgency {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class Urgencies {
  static LOW = { code: "Low", name: "Low" } as Urgency;
  static MEDIUM = { code: "Medium", name: "Medium" } as Urgency;
  static HIGH = { code: "High", name: "High" } as Urgency;
}
