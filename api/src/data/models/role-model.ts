export interface Role {
    role_id: number;
    name?: string;
    department?: string;
    location?: string;
    role_type_id: number;
    employee_id: string;
    created_date: Date;
    creator: number;
    start_date: Date;
    end_date: Date;
}
