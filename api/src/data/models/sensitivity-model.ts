export interface Sensitivity {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class SensitivityLevels {
  static NOT_SENSITIVE = { code: "0", name: "Not Sensitive" } as Sensitivity;
  static SENSITIVE = { code: "1", name: "Sensitive" } as Sensitivity;
  static HIGHLY_SENSITIVE = { code: "2", name: "Highly Sensitive" } as Sensitivity;
}
