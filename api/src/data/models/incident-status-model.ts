export interface IncidentStatus {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class IncidentStatuses {
  static OPEN = { code: "Open", name: "Open" } as IncidentStatus;
  static IN_PROGRESS = { code: "InProg", name: "In Progress" } as IncidentStatus;
  static DUPLICATE = { code: "Dup", name: "Duplicate" } as IncidentStatus;
  static NO_ACTION = { code: "NoAct", name: "No Action" } as IncidentStatus;
  static CLOSED = { code: "Closed", name: "Closed" } as IncidentStatus;
}
