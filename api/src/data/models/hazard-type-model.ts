export interface HazardType {
    code: number;
    name: string;
    description?: string;
    searchable: boolean;
    added_by: Date;
    made_searchable_by?: number;
    created_date?: Date;
    searchable_date: Date; // nullable or not nullable?
}
