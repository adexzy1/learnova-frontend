// Core Types for School Management System

// Tenant/Branding Types
export interface TenantBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface TenantContext {
  id: number;
  tenantId: number;
  name: string;
  slug: string;
  status: number;
  schoolName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  currentSessionId: string | null;
  currentTermId: string | null;
  autoPromoteStudents: boolean;
  lockPastResults: boolean;
  primaryColor: string;
  logoUrl: string | null;
  emailNotificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  onboardingStep: string;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface TenantSubscription {
  id: string;
  status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  trialStartAt: string;
  trialEndAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextPaymentDate: string | null;
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  } | null;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: number;
  createdAt: string;
  admin: TenantAdmin | null;
  userCount: number;
  subscription: TenantSubscription | null;
}

/** Shape returned by GET /tenant (list endpoint) */
export interface TenantListItem {
  id: number;
  name: string;
  domainName: string;
  createdAt: string;
  plan: string | null;
  status: string | null;
  trialEndAt: string | null;
  currentPeriodEnd: string | null;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "term" | "yearly";
  description: string;
  features: string[];
  maxStudents: number;
  maxStaff: number;
  maxStorage: number; // in GB
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: "active" | "trial" | "expired" | "cancelled" | "past_due";
  periodStart: string;
  periodEnd: string;
  trialStartAt: string | null;
  trialEndAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  pendingPlanId: string | null;
  pendingPlanName: string | null;
  cancelledAt?: string;
  usage: {
    students: number;
    staff: number;
    storageUsed: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRecord {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  description: string;
  paymentMethod: string;
  reference: string;
  paidAt: string;
  receiptUrl?: string;
}

export interface PaystackPaymentResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

export interface AcademicConfig {
  currentSessionId: string;
  currentTermId: string;
  gradingSystem: string;
  attendanceType: "daily" | "period-based";
  promotionRules: Record<string, unknown>;
}

// User & Auth Types
export type UserRole = {
  id: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
};

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  isSystem: boolean;
  isActive: boolean;
  activePersona: string;
  personas: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Academic Structure Types
export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  sessionId: string;
  session: Pick<Session, "id" | "name">;
}

export interface ClassLevel {
  id: string;
  name: string;
  level: string;
  description?: string;
  classArms: ClassArm[];
}

export interface ClassArm {
  id: string;
  classLevelId: string;
  name: string;
  capacity: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface GradingSystem {
  id: string;
  name: string;
  description?: string;
  grades: Grade[];
  isDefault?: boolean;
}

export interface Grade {
  id?: string;
  grade: string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  remark: string;
}

// Student Types
export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: "male" | "female";
  email?: string;
  phone?: string;
  address: string;
  passportUrl?: string;
  classId: string;
  classArm?: string;
  className?: string;
  createUserAccount?: boolean;
  status: "active" | "inactive" | "graduated" | "suspended";
  guardians: Guardian[];
  enrollmentDate: string;
}

export interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  isPrimary: boolean;
  createUserAccount?: boolean;
}

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  status: "pending" | "under-review" | "approved" | "rejected" | "enrolled";
  studentData: Partial<Student>;
  documents: Document[];
  entranceExamScore?: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

// Staff Types
export interface Staff {
  id: string;
  staffNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  type: "annual" | "sick" | "maternity" | "paternity" | "unpaid";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

// Assessment Types
export interface CAConfig {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  isLocked: boolean;
}

export interface CAScore {
  id: string;
  studentId: string;
  subjectId: string;
  caConfigId: string;
  score: number;
  termId: string;
  enteredBy: string;
  enteredAt: string;
}

export interface ExamTimetable {
  id: string;
  termId: string;
  subjectId: string;
  subjectName?: string;
  classId: string;
  className?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string | null;
}

export interface Examination {
  id: string;
  name: string;
  sessionId: string;
  termId: string;
  startDate: string;
  endDate: string;
  status: "scheduled" | "ongoing" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface ExamScore {
  id: string;
  studentId: string;
  subjectId: string;
  termId: string;
  score: number;
  maxScore: number;
  enteredBy: string;
  enteredAt: string;
  isModerated: boolean;
  moderatedScore?: number;
}

// Entrance Exam Types
export interface EntranceExam {
  id: string;
  name: string;
  date: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  status: "scheduled" | "in-progress" | "completed";
}

export interface ExamQuestion {
  id: string;
  examId: string;
  type: "mcq" | "theory";
  question: string;
  options?: string[];
  correctAnswer?: number; // index for MCQ
  points: number;
  order: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  applicantId: string;
  startedAt: string;
  completedAt?: string;
  answers: Record<string, string | number>;
  score?: number;
  status: "in-progress" | "completed" | "timed-out";
}

// Results Types
export interface TermResult {
  id: string;
  studentId: string;
  termId: string;
  subjects: SubjectResult[];
  totalScore: number;
  averageScore: number;
  gpa: number;
  rank?: number;
  totalStudents?: number;
  remark: string;
  isPublished: boolean;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  caScores: { name: string; score: number; maxScore: number }[];
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string;
}

// Finance Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  termId: string;
  items: InvoiceItem[];
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "cash" | "bank-transfer" | "card" | "online";
  reference: string;
  paidAt: string;
  receivedBy: string;
}

export interface LedgerEntry {
  id: string;
  entryType: "INCOME" | "EXPENSE";
  sourceType: string;
  sourceId: string;
  amount: number;
  description: string;
  category: string;
  reference: string;
  occurredAt: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  period?: number; // for period-based
  markedBy: string;
  markedAt: string;
  notes?: string;
}

// Communication Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientIds: string[];
  subject: string;
  content: string;
  status: "sent" | "delivered" | "read";
  sentAt: string;
  readAt?: string;
}

// Discipline Types
export interface DisciplineIncident {
  id: string;
  studentId: string;
  studentName: string;
  type: "minor" | "major" | "severe";
  description: string;
  date: string;
  reportedBy: string;
  sanctions: Sanction[];
  counselorNotes?: string;
  status: "open" | "resolved";
}

export interface Sanction {
  id: string;
  type: "warning" | "detention" | "suspension" | "expulsion";
  description: string;
  startDate: string;
  endDate?: string;
  issuedBy: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pageCount: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  };
}

// Table/Filter Types
export interface TableFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export type NextAction =
  | "CHANGE_PASSWORD"
  | "COMPLETE_ONBOARDING"
  | "RESOLVE_SUBSCRIPTION"
  | "UPDATE_COMPANY_PROFILE"
  | "ADD_SESSION"
  | "ADD_TERM"
  | "ADD_CLASS_STRUCTURE"
  | "SET_GRADING_SYSTEM"
  | "ADD_CREDIT_CARD"
  | "NONE";

// ─── API Error (normalized by api-client.ts) ────────────────────────
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Fee Structure ───────────────────────────────────────────────────
export interface FeeStructure {
  id: string;
  name: string;
  description: string;
  amount: number;
  applicableClassIds: string[];
  applicableClasses: string[]; // resolved class names from backend
  termId: string | null;
  isActive: boolean;
}

// ─── Subject-Teacher-Class Assignment ───────────────────────────────
export interface SubjectTeacherAssignment {
  id: string;
  classArmId: string;
  subjectId: string;
  staffId: string;
  classArm: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    name: string;
    code?: string;
  };
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

/** @deprecated Use SubjectTeacherAssignment instead */
export interface SubjectAssignment {
  id: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  classArmId: string;
  classArmName: string;
}

// ─── Paystack Initialize Payment Response ───────────────────────────
export interface PaystackInitResponse {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

// ─── Report Data Shapes ──────────────────────────────────────────────
export interface AttendanceTrendPoint {
  date: string;
  rate: number;
}

export interface FeeCollectionPoint {
  className: string;
  collected: number;
  outstanding: number;
}

export interface PerformancePoint {
  grade: string;
  count: number;
}

export interface ReportData {
  attendanceTrend: AttendanceTrendPoint[];
  feeCollection: FeeCollectionPoint[];
  performance: PerformancePoint[];
  stats: {
    avgAttendance: number;
    feeRecovery: number;
    passRate: number;
  };
}
