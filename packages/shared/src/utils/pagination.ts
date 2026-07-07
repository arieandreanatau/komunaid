import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../constants/pagination';

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function calculatePagination(page?: number, limit?: number): PaginationResult {
  const p = Math.max(1, page || DEFAULT_PAGE);
  const l = Math.min(MAX_LIMIT, Math.max(1, limit || DEFAULT_LIMIT));
  return {
    skip: (p - 1) * l,
    take: l,
    page: p,
    limit: l,
  };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function buildPaginatedResponse<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}
