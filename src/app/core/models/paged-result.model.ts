export interface PagedResult<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}