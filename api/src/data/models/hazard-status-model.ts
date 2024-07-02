export interface HazardStatus {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class HazardStatuses {
  static OPEN = { code: "Open", name: "Open" } as HazardStatus;
  static IN_PROGRESS = { code: "InPro", name: "In Progress" } as HazardStatus;
  static DUPLICATE = { code: "Dup", name: "Duplicate" } as HazardStatus;
  static NO_ACTION = { code: "NoAct", name: "No Action" } as HazardStatus;
  static REMEDIATED = { code: "Remed", name: "Remediated" } as HazardStatus;
}
