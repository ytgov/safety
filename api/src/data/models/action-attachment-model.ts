export interface ActionAttachment {
    id: number;
    action_id: number;
    added_by: string | null; // look into renaming this
    thing: Buffer | null; // look into renaming this
    deleted: boolean;
    deleted_by: string | null;
    added_date: Date;
    deleted_date: Date;
}
