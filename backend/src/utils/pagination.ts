export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function parsePagination(query: PaginationParams): PaginationResult {
  const page = Math.max(1, parseInt(String(query.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 20), 10)));
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  return {
    page,
    limit,
    offset,
    sortBy,
    sortOrder,
  };
}


