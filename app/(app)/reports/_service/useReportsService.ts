import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { REPORTS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type {
  AttendanceTrendPoint,
  FeeCollectionPoint,
  PerformancePoint,
} from "@/types";

interface ReportStats {
  avgAttendance: number;
  feeRecovery: number;
  passRate: number;
}

export default function useReportsService(termId?: string) {
  const params = termId ? { termId } : {};

  const { data: attendanceResponse, isLoading: loadingAttendance } = useQuery<
    AxiosResponse<{ data: AttendanceTrendPoint[] }>
  >({
    queryKey: [queryKeys.REPORTS, "attendance-trend", termId],
    queryFn: () =>
      apiClient.get(REPORTS_ENDPOINTS.ATTENDANCE_TREND, { params }),
  });

  const { data: feeResponse, isLoading: loadingFees } = useQuery<
    AxiosResponse<{ data: FeeCollectionPoint[] }>
  >({
    queryKey: [queryKeys.REPORTS, "fee-collection", termId],
    queryFn: () => apiClient.get(REPORTS_ENDPOINTS.FEE_COLLECTION, { params }),
  });

  const { data: performanceResponse, isLoading: loadingPerformance } = useQuery<
    AxiosResponse<{ data: PerformancePoint[] }>
  >({
    queryKey: [queryKeys.REPORTS, "performance", termId],
    queryFn: () => apiClient.get(REPORTS_ENDPOINTS.PERFORMANCE, { params }),
  });

  const attendanceData = attendanceResponse?.data.data ?? [];
  const feeData = feeResponse?.data.data ?? [];
  const performanceData = performanceResponse?.data.data ?? [];

  // Compute stats from fetched data
  const stats: ReportStats = {
    avgAttendance:
      attendanceData.length > 0
        ? attendanceData.reduce((sum, d) => sum + d.rate, 0) /
          attendanceData.length
        : 0,
    feeRecovery:
      feeData.length > 0
        ? (feeData.reduce((sum, d) => sum + d.collected, 0) /
            Math.max(
              feeData.reduce((sum, d) => sum + d.collected + d.outstanding, 0),
              1,
            )) *
          100
        : 0,
    passRate:
      performanceData.length > 0
        ? (() => {
            const total = performanceData.reduce((s, d) => s + d.count, 0);
            const failing = performanceData
              .filter((d) => d.grade === "F")
              .reduce((s, d) => s + d.count, 0);
            return total > 0 ? ((total - failing) / total) * 100 : 0;
          })()
        : 0,
  };

  return {
    attendanceData,
    feeData,
    performanceData,
    stats,
    isLoading: loadingAttendance || loadingFees || loadingPerformance,
  };
}
