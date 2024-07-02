export interface Scope {
  code: string;
  name: string;
  description?: string;
}

// This list matches the migration - changes should be made in both or
export class Scopes {
  static DEFAULT = { code: "Default", name: "Default" } as Scope;
}
