/**
 * Single source of truth for KomunaID's HTTP response envelope, documented
 * in CLAUDE.md ("API conventions"): every success response is
 * `{ success: true, data }`; paginated lists add a `pagination` block;
 * every error response is `{ success: false, error: { code, message } }`.
 *
 * Before this module, the envelope shape was documented in prose only.
 * `apps/api/src/lib/pagination.ts` built it inline with no shared type, and
 * the web app re-declared its own ad hoc version of it at 93+ call sites
 * (six of them as a formally named, and inconsistent, local
 * `PaginatedResponse`/response interface -- see apps/web/app/admin/page.tsx,
 * apps/web/app/admin/security/page.tsx,
 * apps/web/app/dashboard/events/[eventId]/participants/page.tsx,
 * apps/web/app/dashboard/my-organization-submissions/page.tsx,
 * apps/web/app/dashboard/my-submissions/page.tsx, and
 * apps/web/components/community-dashboard-route.tsx). This module is the
 * one declaration both sides import instead.
 *
 * Like its siblings feature-flags.ts and permissions.ts, this is plain
 * data/types with no Prisma, Next, or Hono import -- @komunaid/shared
 * depends only on zod, and none is needed here either: the envelope shape
 * is produced by the server and trusted, not parsed from untrusted input.
 */

/** The `pagination` block attached to every list response. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** `{ success: true, data }` -- a single-resource or non-paginated response. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** The error shape `app.onError` (apps/api/src/app.ts) and validation
 * failures both use; see CLAUDE.md's "Envelopes" section. Validation
 * errors carry `errors` instead of `error` and are intentionally not
 * modeled here -- callers that need to distinguish should check for
 * `success: false` and inspect the raw payload. */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/** A response that may have failed -- narrow with `isApiSuccess` before
 * reading `.data`. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** `{ success: true, data: T[], pagination }` -- what
 * `paginatedResponse()` (apps/api/src/lib/pagination.ts) produces for every
 * list endpoint. */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
  return response.success === true;
}
