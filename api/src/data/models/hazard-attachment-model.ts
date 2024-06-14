export interface HazardAttachment {
    id: number;
    hazard_id: number;
    added_by: string | null; // look into renaming this
    file: Buffer | null;
    deleted: boolean;
    deleted_by: string | null;
    added_date: Date;
    deleted_date: Date;
}
