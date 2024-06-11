export interface Hazard {
    hazard_id: number;
    hazard_type: number;
    description?: string;
    location?: string;
    location_detail?: string;
    department?: string;
    scope?: string;
    sensitivity?: string;
    created_date?: Date;
    status?: string;
    reopen_count: number;
}
