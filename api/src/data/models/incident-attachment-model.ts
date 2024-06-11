export interface IncidentAttachment {
    id: number;
    incident_id: number;
    added_by?: string; // what is this?? Look into renameing this
    deleted: boolean;
    thing: Buffer; // look into renaming this
    deleted_by?: string;
    added_date: Date;
    deleted_date: Date;
}
