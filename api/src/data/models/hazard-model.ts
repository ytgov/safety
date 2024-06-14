export interface Hazard {
    id: number;
    hazard_type_id: number;
    description: string | null;
    location: string | null;
    location_detail: string | null;
    department: string | null;
    scope: string | null;
    sensitivity: string | null;
    created_at: Date | null;
    status: string | null;
    reopen_count: number;
}
