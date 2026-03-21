/**
 * api-client.ts
 *
 * Wraps the existing axiosClient (which handles cookie-based 401 refresh-retry)
 * and adds:
 *   - Normalized ApiError response interceptor (4xx/5xx → ApiError, never raw AxiosError)
 *
 * Tenant identification is handled by Nginx via subdomain — no X-Tenant-Slug header needed.
 * Auth is handled via HTTP-only cookies — no Bearer token injection needed.
 * All service hooks must import from this file, never from axios directly.
 */
import axiosClient from "@/lib/axios-client";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

// ─── Response Interceptor: normalize errors ─────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 is already handled by axiosClient (refresh + retry).
    // Here we normalize all remaining 4xx/5xx into ApiError.
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data as Record<string, unknown> | undefined;

    if (status >= 400) {
      const apiError: ApiError = {
        statusCode: status,
        message:
          (responseData?.message as string) ||
          (responseData?.error as string) ||
          error.message ||
          "An unexpected error occurred",
        errors: responseData?.errors as Record<string, string[]> | undefined,
      };
      return Promise.reject(apiError);
    }

    // Network errors or other non-HTTP errors
    const apiError: ApiError = {
      statusCode: 0,
      message: error.message || "Network error",
    };
    return Promise.reject(apiError);
  },
);

export default axiosClient;
