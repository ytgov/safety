export interface Hazard {
    id: number;
    hazard_type_id: number;
    description: string | null;
    location_code: string | null;
    location_detail: string | null;
    department_code: string | null;
    scope_code: string | null;
    sensitivity_code: string | null;
    created_at: Date | null;
    status_code: string | null;
    reopen_count: number;
}
