export interface Role {
    id: number;
    name: string | null;
    department_code: string;
    location_code: string | null;
    role_type_id: number;
    employee_id: string;
    created_at: Date;
    creator: number;
    start_date: Date;
    end_date: Date;
}
