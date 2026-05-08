import axios, { AxiosError, AxiosInstance } from "axios";
import { cookies, headers } from "next/headers";

export async function axiosServer(): Promise<AxiosInstance> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const host = headerStore.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseURL = `${protocol}://${host}${process.env.NEXT_PUBLIC_API_URL}`;
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });

  // ─── Server-side Token Refresh Interceptor ──────────────────────
  // On 401, attempt to refresh using the same cookies (which include
  // the refresh token). If refresh succeeds, the response will contain
  // Set-Cookie headers with the new access token — we extract those
  // and re-attach them to the retry request.

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as typeof error.config & {
        _retry?: boolean;
      };

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Call refresh endpoint with the original cookies
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Cookie: cookieHeader,
            },
          },
        );

        // Merge the new access_token + refresh_token Set-Cookie headers into the retry
        const setCookieHeaders = refreshResponse.headers["set-cookie"];
        if (!setCookieHeaders) {
          return Promise.reject(error);
        }

        if (originalRequest.headers) {
          const cookieMap = new Map<string, string>();
          cookieHeader.split("; ").forEach((c) => {
            const [name, ...rest] = c.split("=");
            cookieMap.set(name, rest.join("="));
          });
          setCookieHeaders
            .map((cookie: string) => cookie.split(";")[0])
            .join("; ")
            .split("; ")
            .forEach((c: string) => {
              const [name, ...rest] = c.split("=");
              cookieMap.set(name, rest.join("="));
            });
          originalRequest.headers.Cookie = Array.from(cookieMap.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join("; ");
        }

        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh failed on server side — let the error propagate
        // The calling code (e.g., layout.tsx) will handle the redirect
        return Promise.reject(error);
      }
    },
  );

  return instance;
}
