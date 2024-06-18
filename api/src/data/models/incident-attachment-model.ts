export interface IncidentAttachment {
    id: number;
    incident_id: number;
    added_by_email: string | null;
    deleted: boolean;
    file_name: string | null;
    file_type: string | null;
    file_size: number | null;
    file: Buffer;
    deleted_by: string | null;
    added_date: Date;
    deleted_date: Date;
}
