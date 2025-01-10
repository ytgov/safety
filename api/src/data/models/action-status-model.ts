export interface ActionStatus {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class ActionStatuses {
  static OPEN = { code: "Open", name: "Open" } as ActionStatus;
  static BLOCKED = { code: "Blocked", name: "Blocked" } as ActionStatus;
  static COMPLETE = { code: "Complete", name: "Complete" } as ActionStatus;
  static READY = { code: "Ready", name: "Ready" } as ActionStatus;
}
