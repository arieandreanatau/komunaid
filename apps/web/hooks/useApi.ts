"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "@komunaid/shared";
import { apiGet, apiGetPaginated, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";
import type { AxiosRequestConfig } from "axios";

interface UseApiQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> {
  url: string;
  params?: Record<string, unknown>;
  config?: AxiosRequestConfig;
}

interface UseApiMutationOptions<TData, TVariables, TError = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn"> {
  url: string | ((variables: TVariables) => string);
  method?: "post" | "put" | "patch" | "delete";
  config?: AxiosRequestConfig;
}

/**
 * GET a single-resource endpoint and return its already-unwrapped `data`
 * (see `apiGet` in `@/lib/api`) as `TData`, wired into TanStack Query.
 * Use `useApiPaginatedQuery` instead for list endpoints built with
 * `paginatedResponse()` on the API side -- those need the `pagination`
 * block too, which this hook discards.
 */
export function useApiQuery<TData>({
  url,
  params,
  config,
  ...options
}: UseApiQueryOptions<TData>) {
  return useQuery<TData>({
    queryKey: [url, params] as QueryKey,
    queryFn: () => apiGet<TData>(url, { params, ...config }),
    retry: 2,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * GET a paginated list endpoint and return the full envelope --
 * `{ success, data, pagination }` -- as `PaginatedResponse<TItem>`, wired
 * into TanStack Query. `params` (page, limit, search, ...) is part of the
 * query key so changing them refetches.
 */
export function useApiPaginatedQuery<TItem>({
  url,
  params,
  config,
  ...options
}: UseApiQueryOptions<PaginatedResponse<TItem>>) {
  return useQuery<PaginatedResponse<TItem>>({
    queryKey: [url, params] as QueryKey,
    queryFn: () => apiGetPaginated<TItem>(url, { params, ...config }),
    retry: 2,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Mutate via POST/PUT/PATCH/DELETE and return the unwrapped `data` as
 * `TData`, wired into TanStack Query.
 */
export function useApiMutation<TData, TVariables = unknown>({
  url,
  method = "post",
  config,
  ...options
}: UseApiMutationOptions<TData, TVariables>) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const endpoint = typeof url === "function" ? url(variables) : url;
      switch (method) {
        case "put":
          return apiPut<TData>(endpoint, variables, config);
        case "patch":
          return apiPatch<TData>(endpoint, variables, config);
        case "delete":
          return apiDelete<TData>(endpoint, config);
        default:
          return apiPost<TData>(endpoint, variables, config);
      }
    },
    onError: (error) => {
      console.error(`API Mutation Error [${method} ${url}]:`, error);
    },
    ...options,
  });
}

export function useInvalidateQueries(queryKey: string | string[]) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
  };
}
