export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export function successResponse<T>(data: T, meta?: SuccessResponse<T>["meta"]): SuccessResponse<T> {
  const response: SuccessResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return response;
}

export function errorResponse(code: string, message: string, details?: ErrorResponse["error"]["details"]): ErrorResponse {
  return {
    success: false,
    error: { code, message, details },
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): SuccessResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
