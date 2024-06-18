export interface RoleType {
    id: number;
    name: string;
    permissions: number;
    description: string; // why not nullable?
}
