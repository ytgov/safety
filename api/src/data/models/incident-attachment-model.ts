export interface IncidentAttachment {
    id: number;
    incident_id: number;
    added_by: string | null; // what is this?? Look into renameing this
    deleted: boolean;
    file: Buffer;
    deleted_by: string | null;
    added_date: Date;
    deleted_date: Date;
}
