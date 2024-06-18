export interface HazardAttachment {
    id: number;
    hazard_id: number;
    added_by_email: string | null;
    file_name: string | null;
    file_type: string | null;
    file_size: number | null;
    file: Buffer | null;
    deleted: boolean;
    deleted_by: string | null;
    added_date: Date;
    deleted_date: Date;
}
