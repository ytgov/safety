export interface IncidentAttachment {
    id: number;
    incident_id: number;
    added_by_email: string | null;
    deleted: boolean;
    file: Buffer;
    deleted_by: string | null;
    added_date: Date;
    deleted_date: Date;
}
