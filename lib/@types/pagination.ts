export interface PaginatedDocs {
    page: number;
    limit: number;
    totalDocs: number;
    pageCount: number;
    next: number | null;
    prev: number | null;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}