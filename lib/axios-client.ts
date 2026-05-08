import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ─────────────────────────────────────────────────────────────
// Axios instance (CLIENT ONLY)
// Uses relative baseURL so Nginx handles routing + subdomains
// ─────────────────────────────────────────────────────────────

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─────────────────────────────────────────────────────────────
// 401 handling: refresh cookie → retry original request
// ─────────────────────────────────────────────────────────────

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(axiosClient(config));
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axiosClient.post("/auth/refresh");
      // New access_token cookie is set by the server automatically via withCredentials
      processQueue(null);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;
