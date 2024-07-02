export interface ActionType {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class ActionTypes {
  static SYSTEM_GENERATED = { code: "System", name: "System Generated" } as ActionType;
  static USER_GENERATED = { code: "User", name: "User Generated" } as ActionType;
}
