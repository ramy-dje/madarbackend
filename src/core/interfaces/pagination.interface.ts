export interface PaginationQueryInterface {
  page?: number; // the number of the pages
  size?: number; // the limit of page
}

export interface PaginatedResponse<T> {
  data: T[]; // the data of the page
  total: number; // the total number of items in the collection
  page: number; // the number of the pages
  size: number; // the limit of page
  totalPages?: number; // total number of pages
  hasNext?: boolean; // if there is a next page
  hasPrev?: boolean; // if there is a previous page
}

// Alias for backward compatibility
export type ResponseWithPaginationInterface<T> = PaginatedResponse<T>;
