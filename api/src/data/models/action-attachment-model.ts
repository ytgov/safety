export interface ActionAttachment {
    id: number;
    action_id: number;
    added_by?: string; // look into renaming this
    thing?: Buffer; // look into renaming this
    deleted: boolean;
    deleted_by?: string;
    added_date: Date;
    deleted_date: Date;
}
