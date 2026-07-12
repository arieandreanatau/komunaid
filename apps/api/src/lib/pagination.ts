import { MAX_LIMIT, DEFAULT_LIMIT } from "@komunaid/constants";

export function parsePagination(
  url: string,
  defaults?: { page?: number; limit?: number; maxLimit?: number },
) {
  const params = new URL(url).searchParams;
  const maxLimit = defaults?.maxLimit ?? MAX_LIMIT;
  const rawPage = parseInt(params.get("page") || String(defaults?.page ?? 1));
  const rawLimit = parseInt(params.get("limit") || String(defaults?.limit ?? DEFAULT_LIMIT));
  const page = Math.max(1, isNaN(rawPage) ? (defaults?.page ?? 1) : rawPage);
  const limit = Math.min(
    maxLimit,
    Math.max(1, isNaN(rawLimit) ? (defaults?.limit ?? DEFAULT_LIMIT) : rawLimit),
  );
  const search = params.get("search") || "";
  const sort = params.get("sort") || "desc";
  const orderBy = params.get("orderBy") || "createdAt";
  return { page, limit, search, sort, orderBy, skip: (page - 1) * limit };
}

export function paginatedResponse(data: any[], total: number, page: number, limit: number) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
