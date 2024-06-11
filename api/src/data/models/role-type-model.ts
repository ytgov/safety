export interface RoleType {
    role_type_id: number;
    name: string;
    permissions: number;
    description: string; // why not nullable?
}
