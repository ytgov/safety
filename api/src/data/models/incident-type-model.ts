export interface IncidentType {
    code: string;
    name: string;
    description?: string;
    searchable: boolean;
    added_by: number;
    made_searchable_by?: number;
    created_date?: Date;
    searchable_date: Date; // nullable or not ?
}
