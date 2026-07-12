"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import api from "@/lib/api";
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

export function useApiQuery<TData>({
  url,
  params,
  config,
  ...options
}: UseApiQueryOptions<TData>) {
  return useQuery<TData>({
    queryKey: [url, params] as QueryKey,
    queryFn: async () => {
      const res = await api.get(url, { params, ...config });
      return res.data as TData;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useApiMutation<TData, TVariables = unknown>({
  url,
  method = "post",
  config,
  ...options
}: UseApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const endpoint = typeof url === "function" ? url(variables) : url;
      let res;
      switch (method) {
        case "put":
          res = await api.put(endpoint, variables, config);
          break;
        case "patch":
          res = await api.patch(endpoint, variables, config);
          break;
        case "delete":
          res = await api.delete(endpoint, config);
          break;
        default:
          res = await api.post(endpoint, variables, config);
      }
      return res.data as TData;
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
