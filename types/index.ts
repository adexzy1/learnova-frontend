// Core Types for School Management System

// Tenant/Branding Types
export interface TenantBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  schoolName: string;
  branding: TenantBranding;
  academicConfig: AcademicConfig;
}

export interface AcademicConfig {
  currentSessionId: string;
  currentTermId: string;
  gradingSystem: string;
  attendanceType: "daily" | "period-based";
  promotionRules: Record<string, unknown>;
}

// User & Auth Types
export type UserRole =
  | "super-admin"
  | "school-admin"
  | "teacher"
  | "student"
  | "parent"
  | "finance-officer";

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
  tenantUsers: Array<{
    role: string;
    tenant: {
      id: number;
      name: string;
    };
  }>;
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
  grades: Grade[];
}

export interface Grade {
  id: string;
  letter: string;
  minScore: number;
  maxScore: number;
  gpa: number;
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
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  subjects?: string[];
  classes?: string[];
  hireDate: string;
  status: "active" | "inactive" | "on-leave";
  photo?: string;
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
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
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
  paidAmount: number;
  balance: number;
  status: "unpaid" | "partial" | "paid" | "overdue";
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
  date: string;
  description: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  category: string;
  reference: string;
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
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
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
