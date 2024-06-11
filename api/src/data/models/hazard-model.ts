export interface Hazard {
    id: number;
    hazard_type: number;
    description?: string;
    location?: string;
    location_detail?: string;
    department?: string;
    scope?: string;
    sensitivity?: string;
    created_at?: Date;
    status?: string;
    reopen_count: number;
}
