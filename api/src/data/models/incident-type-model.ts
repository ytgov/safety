export interface IncidentType {
    id: number;
    name: string;
    description?: string;
    searchable: boolean;
    added_by: number;
    made_searchable_by?: number;
    created_at?: Date;
    searchable_on?: Date;
}
