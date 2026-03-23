import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { DASHBOARD_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { AxiosResponse } from "axios";

// ── Response types ──────────────────────────────────────────────────

interface RespopnseWrapper<T> {
  data: T;
}

interface TrendData {
  change: number;
  percentage: number;
}

interface Meta {
  cachedAt: string | null;
}

interface ContextResponse {
  session: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  term: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  meta: Meta;
}

interface PeopleResponse {
  activeStudents: number;
  activeStaff: number;
  studentsTrend: TrendData | null;
  staffTrend: TrendData | null;
  meta: Meta;
}

interface AttendanceResponse {
  attendanceRate: number | null;
  attendanceTrend: TrendData | null;
  weeklyChart: { date: string; present: number; absent: number }[];
  meta: Meta;
}

interface AcademicResponse {
  passRate: number | null;
  passRateTrend: TrendData | null;
  gradeDistribution: { A: number; B: number; C: number; D: number; F: number };
  meta: Meta;
}

interface ClassesResponse {
  totalClasses: number;
  totalClassArms: number;
  meta: Meta;
}

interface FinanceSummaryResponse {
  outstandingBalance: number;
  collectionRate: number | null;
  overdueInvoiceCount: number;
  balanceTrend: TrendData | null;
  collectionTrend: TrendData | null;
  meta: Meta;
}

interface RevenueResponse {
  revenueChart: { month: string; income: number; expense: number }[];
  meta: Meta;
}

interface PaymentItem {
  id: string;
  amount: number;
  paymentMethod: string;
  reference: string | null;
  paidAt: string;
  studentFirstName: string;
  studentLastName: string;
  admissionNumber: string;
}

interface PaymentsResponse {
  payments: PaymentItem[];
  meta: Meta;
}

interface ExamItem {
  id: string;
  subjectName: string;
  classArmName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string | null;
}

interface UpcomingExamsResponse {
  count: number;
  exams: ExamItem[];
  meta: Meta;
}

// ── Hook ────────────────────────────────────────────────────────────

const STALE_TIME = 55_000; // slightly under 60s server cache

export function useDashboardService() {
  const context = useQuery<AxiosResponse<RespopnseWrapper<ContextResponse>>>({
    queryKey: [queryKeys.DASHBOARD_CONTEXT],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.CONTEXT),
    staleTime: STALE_TIME,
  });

  const people = useQuery<AxiosResponse<RespopnseWrapper<PeopleResponse>>>({
    queryKey: [queryKeys.DASHBOARD_PEOPLE],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.PEOPLE),
    staleTime: STALE_TIME,
  });

  const attendance = useQuery<
    AxiosResponse<RespopnseWrapper<AttendanceResponse>>
  >({
    queryKey: [queryKeys.DASHBOARD_ATTENDANCE],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.ATTENDANCE),
    staleTime: STALE_TIME,
  });

  const academic = useQuery<AxiosResponse<RespopnseWrapper<AcademicResponse>>>({
    queryKey: [queryKeys.DASHBOARD_ACADEMIC],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.ACADEMIC_PERFORMANCE),
    staleTime: STALE_TIME,
  });

  const classes = useQuery<AxiosResponse<RespopnseWrapper<ClassesResponse>>>({
    queryKey: [queryKeys.DASHBOARD_CLASSES],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.CLASSES),
    staleTime: STALE_TIME,
  });

  const financeSummary = useQuery<
    AxiosResponse<RespopnseWrapper<FinanceSummaryResponse>>
  >({
    queryKey: [queryKeys.DASHBOARD_FINANCE_SUMMARY],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.FINANCE_SUMMARY),
    staleTime: STALE_TIME,
  });

  const revenue = useQuery<AxiosResponse<RespopnseWrapper<RevenueResponse>>>({
    queryKey: [queryKeys.DASHBOARD_FINANCE_REVENUE],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.FINANCE_REVENUE),
    staleTime: STALE_TIME,
  });

  const payments = useQuery<AxiosResponse<RespopnseWrapper<PaymentsResponse>>>({
    queryKey: [queryKeys.DASHBOARD_FINANCE_PAYMENTS],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.FINANCE_PAYMENTS),
    staleTime: STALE_TIME,
  });

  const upcomingExams = useQuery<
    AxiosResponse<RespopnseWrapper<UpcomingExamsResponse>>
  >({
    queryKey: [queryKeys.DASHBOARD_UPCOMING_EXAMS],
    queryFn: () => apiClient.get(DASHBOARD_ENDPOINTS.UPCOMING_EXAMS),
    staleTime: STALE_TIME,
  });

  return {
    context,
    people,
    attendance,
    academic,
    classes,
    financeSummary,
    revenue,
    payments,
    upcomingExams,
  };
}

export type {
  TrendData,
  PeopleResponse,
  AttendanceResponse,
  AcademicResponse,
  ClassesResponse,
  FinanceSummaryResponse,
  RevenueResponse,
  PaymentsResponse,
  UpcomingExamsResponse,
  PaymentItem,
  ExamItem,
};
