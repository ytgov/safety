export interface HazardType {
    id: number;
    name: string;
    description?: string;
    searchable: boolean;
    added_by: Date;
    made_searchable_by?: number;
    created_at?: Date;
    searchable_on?: Date;
}
