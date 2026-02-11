// Mock API functions for the School Management System
// In production, these would make actual API calls

import type {
  Student,
  Staff,
  Session,
  Term,
  ClassLevel,
  Subject,
  Invoice,
  AttendanceRecord,
  CAScore,
  ExamScore,
  TermResult,
  AdmissionApplication,
  DisciplineIncident,
  Notification,
  Message,
  PaginatedResponse,
  TableFilters,
} from "@/types";

// Simulate API delay
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Generic fetch wrapper with mock data
async function mockFetch<T>(data: T, delayMs = 500): Promise<T> {
  await delay(delayMs);
  return data;
}

// ==================== STUDENTS ====================
export async function fetchStudents(
  filters?: TableFilters,
): Promise<PaginatedResponse<Student>> {
  const mockStudents: Student[] = [
    {
      id: "student-1",
      admissionNumber: "ADM001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "2010-05-15",
      gender: "male",
      email: "john.doe@example.com",
      address: "123 Main St, City",
      classId: "class-1a",
      className: "JSS 1A",
      status: "active",
      guardians: [
        {
          id: "guardian-1",
          firstName: "James",
          lastName: "Doe",
          relationship: "Father",
          email: "james.doe@example.com",
          phone: "+234801234567",
          address: "123 Main St, City",
          isPrimary: true,
        },
      ],
      enrollmentDate: "2023-09-01",
    },
    {
      id: "student-2",
      admissionNumber: "ADM002",
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: "2010-08-20",
      gender: "female",
      email: "jane.smith@example.com",
      address: "456 Oak Ave, City",
      classId: "class-1a",
      className: "JSS 1A",
      status: "active",
      guardians: [
        {
          id: "guardian-2",
          firstName: "Mary",
          lastName: "Smith",
          relationship: "Mother",
          email: "mary.smith@example.com",
          phone: "+234802345678",
          address: "456 Oak Ave, City",
          isPrimary: true,
        },
      ],
      enrollmentDate: "2023-09-01",
    },
    {
      id: "student-3",
      admissionNumber: "ADM003",
      firstName: "Michael",
      lastName: "Johnson",
      dateOfBirth: "2009-03-10",
      gender: "male",
      address: "789 Pine Rd, City",
      classId: "class-2a",
      className: "JSS 2A",
      status: "active",
      guardians: [
        {
          id: "guardian-3",
          firstName: "Robert",
          lastName: "Johnson",
          relationship: "Father",
          email: "robert.johnson@example.com",
          phone: "+234803456789",
          address: "789 Pine Rd, City",
          isPrimary: true,
        },
      ],
      enrollmentDate: "2022-09-01",
    },
  ];

  return mockFetch({
    data: mockStudents,
    total: mockStudents.length,
    page: filters?.page || 1,
    pageSize: filters?.pageSize || 10,
    totalPages: 1,
  });
}

export async function fetchStudent(id: string): Promise<Student> {
  const students = await fetchStudents();
  const student = students.data.find((s) => s.id === id);
  if (!student) throw new Error("Student not found");
  return student;
}

export async function createStudent(data: Partial<Student>): Promise<Student> {
  await delay(500);
  return {
    id: `student-${Date.now()}`,
    admissionNumber: `ADM${Date.now()}`,
    ...data,
    status: "active",
    enrollmentDate: new Date().toISOString(),
  } as Student;
}

export async function updateStudent(
  id: string,
  data: Partial<Student>,
): Promise<Student> {
  const student = await fetchStudent(id);
  return mockFetch({ ...student, ...data });
}

// ==================== STAFF ====================
export async function fetchStaff(
  filters?: TableFilters,
): Promise<PaginatedResponse<Staff>> {
  const mockStaff: Staff[] = [
    {
      id: "staff-1",
      employeeId: "EMP001",
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah.williams@school.com",
      phone: "+234804567890",
      role: "teacher",
      department: "Sciences",
      subjects: ["Mathematics", "Physics"],
      classes: ["JSS 1A", "JSS 2A"],
      hireDate: "2020-01-15",
      status: "active",
    },
    {
      id: "staff-2",
      employeeId: "EMP002",
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@school.com",
      phone: "+234805678901",
      role: "teacher",
      department: "Languages",
      subjects: ["English", "Literature"],
      classes: ["JSS 1A", "JSS 1B"],
      hireDate: "2019-08-20",
      status: "active",
    },
    {
      id: "staff-3",
      employeeId: "EMP003",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@school.com",
      phone: "+234806789012",
      role: "finance-officer",
      department: "Finance",
      hireDate: "2021-03-01",
      status: "active",
    },
  ];

  return mockFetch({
    data: mockStaff,
    total: mockStaff.length,
    page: filters?.page || 1,
    pageSize: filters?.pageSize || 10,
    totalPages: 1,
  });
}

// ==================== ACADEMIC STRUCTURE ====================
export async function fetchSessions(): Promise<Session[]> {
  return mockFetch([
    {
      id: "session-2024-2025",
      name: "2024/2025 Academic Session",
      startDate: "2024-09-01",
      endDate: "2025-07-31",
      isActive: true,
    },
    {
      id: "session-2023-2024",
      name: "2023/2024 Academic Session",
      startDate: "2023-09-01",
      endDate: "2024-07-31",
      isActive: false,
    },
  ]);
}

export async function fetchTerms(sessionId?: string): Promise<Term[]> {
  const terms: Term[] = [
    {
      id: "term-1",
      sessionId: "session-2024-2025",
      name: "First Term",
      startDate: "2024-09-01",
      endDate: "2024-12-15",
      isActive: true,
    },
    {
      id: "term-2",
      sessionId: "session-2024-2025",
      name: "Second Term",
      startDate: "2025-01-06",
      endDate: "2025-04-15",
      isActive: false,
    },
    {
      id: "term-3",
      sessionId: "session-2024-2025",
      name: "Third Term",
      startDate: "2025-04-28",
      endDate: "2025-07-31",
      isActive: false,
    },
  ];

  if (sessionId) {
    return mockFetch(terms.filter((t) => t.sessionId === sessionId));
  }
  return mockFetch(terms);
}

export async function fetchClasses(): Promise<ClassLevel[]> {
  return mockFetch([
    {
      id: "jss1",
      name: "JSS 1",
      order: 1,
      arms: [
        { id: "class-1a", classLevelId: "jss1", name: "A", capacity: 40 },
        { id: "class-1b", classLevelId: "jss1", name: "B", capacity: 40 },
      ],
    },
    {
      id: "jss2",
      name: "JSS 2",
      order: 2,
      arms: [
        { id: "class-2a", classLevelId: "jss2", name: "A", capacity: 40 },
        { id: "class-2b", classLevelId: "jss2", name: "B", capacity: 40 },
      ],
    },
    {
      id: "jss3",
      name: "JSS 3",
      order: 3,
      arms: [{ id: "class-3a", classLevelId: "jss3", name: "A", capacity: 40 }],
    },
    {
      id: "sss1",
      name: "SSS 1",
      order: 4,
      arms: [
        { id: "class-ss1a", classLevelId: "sss1", name: "A", capacity: 35 },
        { id: "class-ss1b", classLevelId: "sss1", name: "B", capacity: 35 },
      ],
    },
  ]);
}

export async function fetchSubjects(): Promise<Subject[]> {
  return mockFetch([
    { id: "sub-1", name: "Mathematics", code: "MTH", isActive: true },
    { id: "sub-2", name: "English Language", code: "ENG", isActive: true },
    { id: "sub-3", name: "Physics", code: "PHY", isActive: true },
    { id: "sub-4", name: "Chemistry", code: "CHM", isActive: true },
    { id: "sub-5", name: "Biology", code: "BIO", isActive: true },
    { id: "sub-6", name: "Literature", code: "LIT", isActive: true },
    { id: "sub-7", name: "Geography", code: "GEO", isActive: true },
    { id: "sub-8", name: "History", code: "HIS", isActive: true },
    { id: "sub-9", name: "Civic Education", code: "CIV", isActive: true },
    { id: "sub-10", name: "Computer Science", code: "CSC", isActive: true },
  ]);
}

// ==================== FINANCE ====================
export async function fetchInvoices(
  filters?: TableFilters,
): Promise<PaginatedResponse<Invoice>> {
  const mockInvoices: Invoice[] = [
    {
      id: "inv-1",
      invoiceNumber: "INV-2024-001",
      studentId: "student-1",
      studentName: "John Doe",
      termId: "term-1",
      items: [
        { id: "item-1", description: "School Fees", amount: 150000 },
        { id: "item-2", description: "Books", amount: 25000 },
        { id: "item-3", description: "Uniform", amount: 15000 },
      ],
      totalAmount: 190000,
      paidAmount: 100000,
      balance: 90000,
      status: "partial",
      dueDate: "2024-10-15",
      createdAt: "2024-09-01",
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-2024-002",
      studentId: "student-2",
      studentName: "Jane Smith",
      termId: "term-1",
      items: [
        { id: "item-4", description: "School Fees", amount: 150000 },
        { id: "item-5", description: "Books", amount: 25000 },
      ],
      totalAmount: 175000,
      paidAmount: 175000,
      balance: 0,
      status: "paid",
      dueDate: "2024-10-15",
      createdAt: "2024-09-01",
    },
    {
      id: "inv-3",
      invoiceNumber: "INV-2024-003",
      studentId: "student-3",
      studentName: "Michael Johnson",
      termId: "term-1",
      items: [{ id: "item-6", description: "School Fees", amount: 160000 }],
      totalAmount: 160000,
      paidAmount: 0,
      balance: 160000,
      status: "unpaid",
      dueDate: "2024-10-15",
      createdAt: "2024-09-01",
    },
  ];

  return mockFetch({
    data: mockInvoices,
    total: mockInvoices.length,
    page: filters?.page || 1,
    pageSize: filters?.pageSize || 10,
    totalPages: 1,
  });
}

// ==================== ATTENDANCE ====================
export async function fetchAttendance(
  classId: string,
  date: string,
): Promise<AttendanceRecord[]> {
  return mockFetch([
    {
      id: "att-1",
      studentId: "student-1",
      classId,
      date,
      status: "present",
      markedBy: "staff-1",
      markedAt: date,
    },
    {
      id: "att-2",
      studentId: "student-2",
      classId,
      date,
      status: "present",
      markedBy: "staff-1",
      markedAt: date,
    },
    {
      id: "att-3",
      studentId: "student-3",
      classId,
      date,
      status: "absent",
      markedBy: "staff-1",
      markedAt: date,
    },
  ]);
}

export async function saveAttendance(
  records: Partial<AttendanceRecord>[],
): Promise<AttendanceRecord[]> {
  return mockFetch(
    records.map((r, i) => ({
      id: `att-${Date.now()}-${i}`,
      ...r,
      markedAt: new Date().toISOString(),
    })) as AttendanceRecord[],
  );
}

// ==================== ASSESSMENTS ====================
export async function fetchCAScores(
  subjectId: string,
  classId: string,
  termId: string,
): Promise<CAScore[]> {
  return mockFetch([
    {
      id: "ca-1",
      studentId: "student-1",
      subjectId,
      caConfigId: "ca-test-1",
      score: 18,
      termId,
      enteredBy: "staff-1",
      enteredAt: "2024-10-01",
    },
    {
      id: "ca-2",
      studentId: "student-2",
      subjectId,
      caConfigId: "ca-test-1",
      score: 15,
      termId,
      enteredBy: "staff-1",
      enteredAt: "2024-10-01",
    },
    {
      id: "ca-3",
      studentId: "student-1",
      subjectId,
      caConfigId: "ca-test-2",
      score: 12,
      termId,
      enteredBy: "staff-1",
      enteredAt: "2024-11-01",
    },
    {
      id: "ca-4",
      studentId: "student-2",
      subjectId,
      caConfigId: "ca-test-2",
      score: 14,
      termId,
      enteredBy: "staff-1",
      enteredAt: "2024-11-01",
    },
  ]);
}

export async function saveCAScores(
  scores: Partial<CAScore>[],
): Promise<CAScore[]> {
  return mockFetch(
    scores.map((s, i) => ({
      id: `ca-${Date.now()}-${i}`,
      ...s,
      enteredAt: new Date().toISOString(),
    })) as CAScore[],
  );
}

export async function fetchExamScores(
  subjectId: string,
  classId: string,
  termId: string,
): Promise<ExamScore[]> {
  return mockFetch([
    {
      id: "exam-1",
      studentId: "student-1",
      subjectId,
      termId,
      score: 65,
      maxScore: 70,
      enteredBy: "staff-1",
      enteredAt: "2024-12-01",
      isModerated: false,
    },
    {
      id: "exam-2",
      studentId: "student-2",
      subjectId,
      termId,
      score: 58,
      maxScore: 70,
      enteredBy: "staff-1",
      enteredAt: "2024-12-01",
      isModerated: false,
    },
  ]);
}

// ==================== RESULTS ====================
export async function fetchTermResults(
  studentId: string,
  termId: string,
): Promise<TermResult | null> {
  return mockFetch({
    id: "result-1",
    studentId,
    termId,
    subjects: [
      {
        subjectId: "sub-1",
        subjectName: "Mathematics",
        caScores: [
          { name: "Test 1", score: 18, maxScore: 20 },
          { name: "Test 2", score: 12, maxScore: 15 },
        ],
        examScore: 65,
        totalScore: 85,
        grade: "A",
        remark: "Excellent",
      },
      {
        subjectId: "sub-2",
        subjectName: "English Language",
        caScores: [
          { name: "Test 1", score: 15, maxScore: 20 },
          { name: "Test 2", score: 10, maxScore: 15 },
        ],
        examScore: 55,
        totalScore: 75,
        grade: "B",
        remark: "Very Good",
      },
    ],
    totalScore: 160,
    averageScore: 80,
    gpa: 3.8,
    rank: 3,
    totalStudents: 40,
    remark: "Excellent performance. Keep it up!",
    isPublished: true,
  });
}

// ==================== ADMISSIONS ====================
export async function fetchAdmissions(
  filters?: TableFilters,
): Promise<PaginatedResponse<AdmissionApplication>> {
  const mockAdmissions: AdmissionApplication[] = [
    {
      id: "adm-1",
      applicationNumber: "APP-2024-001",
      status: "pending",
      studentData: {
        firstName: "Alice",
        lastName: "Brown",
        dateOfBirth: "2011-03-15",
        gender: "female",
      },
      documents: [
        {
          id: "doc-1",
          name: "Birth Certificate",
          type: "pdf",
          url: "/docs/bc.pdf",
          uploadedAt: "2024-08-01",
        },
      ],
      submittedAt: "2024-08-01",
    },
    {
      id: "adm-2",
      applicationNumber: "APP-2024-002",
      status: "under-review",
      studentData: {
        firstName: "Bob",
        lastName: "Wilson",
        dateOfBirth: "2010-07-22",
        gender: "male",
      },
      documents: [],
      submittedAt: "2024-08-05",
      entranceExamScore: 75,
    },
  ];

  return mockFetch({
    data: mockAdmissions,
    total: mockAdmissions.length,
    page: filters?.page || 1,
    pageSize: filters?.pageSize || 10,
    totalPages: 1,
  });
}

// ==================== DISCIPLINE ====================
export async function fetchDisciplineIncidents(
  studentId?: string,
): Promise<DisciplineIncident[]> {
  return mockFetch([
    {
      id: "inc-1",
      studentId: "student-3",
      studentName: "Michael Johnson",
      type: "minor",
      description: "Late to class multiple times",
      date: "2024-10-15",
      reportedBy: "staff-1",
      sanctions: [
        {
          id: "sanc-1",
          type: "warning",
          description: "Verbal warning issued",
          startDate: "2024-10-15",
          issuedBy: "staff-1",
        },
      ],
      status: "resolved",
    },
  ]);
}

// ==================== COMMUNICATIONS ====================
export async function fetchNotifications(): Promise<Notification[]> {
  return mockFetch([
    {
      id: "notif-1",
      title: "Term Results Published",
      message: "First term results for 2024/2025 session have been published.",
      type: "success",
      isRead: false,
      createdAt: "2024-12-15T10:00:00Z",
      link: "/results",
    },
    {
      id: "notif-2",
      title: "Payment Reminder",
      message: "School fees payment deadline is approaching.",
      type: "warning",
      isRead: true,
      createdAt: "2024-12-10T09:00:00Z",
      link: "/finance/invoices",
    },
  ]);
}

export async function fetchMessages(): Promise<Message[]> {
  return mockFetch([
    {
      id: "msg-1",
      senderId: "staff-1",
      senderName: "Sarah Williams",
      recipientIds: ["user-3"],
      subject: "Progress Report Discussion",
      content:
        "I would like to schedule a meeting to discuss your child's progress.",
      status: "read",
      sentAt: "2024-12-01T14:00:00Z",
      readAt: "2024-12-01T16:30:00Z",
    },
  ]);
}

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  attendanceRate: number;
  revenueCollected: number;
  pendingInvoices: number;
  upcomingExams: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return mockFetch({
    totalStudents: 450,
    totalStaff: 35,
    totalClasses: 12,
    attendanceRate: 94.5,
    revenueCollected: 45000000,
    pendingInvoices: 23,
    upcomingExams: 5,
    recentActivities: [
      {
        id: "1",
        type: "admission",
        description: "New student application received",
        timestamp: "2024-12-15T10:30:00Z",
      },
      {
        id: "2",
        type: "payment",
        description: "Payment of ₦150,000 received from John Doe",
        timestamp: "2024-12-15T09:15:00Z",
      },
      {
        id: "3",
        type: "attendance",
        description: "Attendance marked for JSS 1A",
        timestamp: "2024-12-15T08:00:00Z",
      },
    ],
  });
}

// ==================== FEE TYPES ====================
export interface FeeType {
  id: string;
  name: string;
  description: string;
  amount: number;
  applicableTo: string;
  isActive: boolean;
}

export async function fetchFeeTypes(): Promise<FeeType[]> {
  return mockFetch([
    {
      id: "fee-1",
      name: "School Fees",
      description: "Tuition and general fees",
      amount: 150000,
      applicableTo: "all",
      isActive: true,
    },
    {
      id: "fee-2",
      name: "Examination Fee",
      description: "Terminal examination fee",
      amount: 25000,
      applicableTo: "all",
      isActive: true,
    },
    {
      id: "fee-3",
      name: "Sports Fee",
      description: "Annual sports activities",
      amount: 10000,
      applicableTo: "all",
      isActive: true,
    },
    {
      id: "fee-4",
      name: "Laboratory Fee",
      description: "Science laboratory usage",
      amount: 15000,
      applicableTo: "SSS",
      isActive: true,
    },
    {
      id: "fee-5",
      name: "Library Fee",
      description: "Library maintenance",
      amount: 5000,
      applicableTo: "all",
      isActive: true,
    },
  ]);
}

// ==================== EXAMINATIONS ====================
export interface Examination {
  id: string;
  tenantId: string;
  name: string;
  sessionId: string;
  termId: string;
  startDate: string;
  endDate: string;
  status: "scheduled" | "ongoing" | "completed";
  createdAt: string;
  updatedAt: string;
}

export async function fetchExaminations(): Promise<Examination[]> {
  return mockFetch([
    {
      id: "exam-1",
      tenantId: "tenant-1",
      name: "First Term Examination",
      sessionId: "session-2024-2025",
      termId: "term-1",
      startDate: "2024-12-02",
      endDate: "2024-12-13",
      status: "completed",
      createdAt: "2024-11-01",
      updatedAt: "2024-12-13",
    },
    {
      id: "exam-2",
      tenantId: "tenant-1",
      name: "Second Term Examination",
      sessionId: "session-2024-2025",
      termId: "term-2",
      startDate: "2025-04-01",
      endDate: "2025-04-12",
      status: "scheduled",
      createdAt: "2025-01-15",
      updatedAt: "2025-01-15",
    },
  ]);
}

// ==================== MOCK API OBJECT ====================
// This object provides a unified interface for all API functions
export const mockApi = {
  // Students
  getStudents: async () => (await fetchStudents()).data,
  getStudent: fetchStudent,
  createStudent,
  updateStudent,

  // Staff
  getStaff: async () => (await fetchStaff()).data,

  // Academic Structure
  getSessions: fetchSessions,
  getTerms: fetchTerms,
  getClasses: fetchClasses,
  getSubjects: fetchSubjects,

  // Finance
  getInvoices: async () => (await fetchInvoices()).data,
  getFeeTypes: fetchFeeTypes,

  // Attendance
  getAttendance: fetchAttendance,
  saveAttendance,

  // Assessments
  getCAScores: fetchCAScores,
  saveCAScores,
  getExamScores: fetchExamScores,

  // Results
  getTermResults: fetchTermResults,

  // Admissions
  getAdmissions: async () => (await fetchAdmissions()).data,

  // Discipline
  getDisciplineIncidents: fetchDisciplineIncidents,

  // Communications
  getNotifications: fetchNotifications,
  getMessages: fetchMessages,

  // Dashboard
  getDashboardStats: fetchDashboardStats,

  // Examinations
  getExaminations: fetchExaminations,
};
