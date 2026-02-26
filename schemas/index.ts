import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Student Schemas
export const guardianSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  isPrimary: z.boolean().default(false),
  createUserAccount: z.boolean().default(false),
});

export const studentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  classArm: z.string().min(1, "Class is required"),
  passport: z.any().optional(),
  createUserAccount: z.boolean().default(false),
  guardians: z
    .array(guardianSchema)
    .min(1, "At least one guardian is required"),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Admission Schema
export const admissionSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),

  // Contact Information
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(5, "Address is required"),

  // Academic Information
  previousSchool: z.string().optional(),
  appliedClass: z.string().min(1, "Applied class is required"),

  // Guardian Information
  guardians: z
    .array(guardianSchema)
    .min(1, "At least one guardian is required"),
});

export type AdmissionFormData = z.infer<typeof admissionSchema>;

// Academic Structure Schemas
export const sessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(false),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

export const termSchema = z.object({
  session: z.string().min(1, "Session is required"),
  name: z.string().min(1, "Term name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(false),
});

export type TermFormData = z.infer<typeof termSchema>;

export const classLevelSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  level: z.string().min(1, "Level is required"),
  description: z.string().optional(),
});

export type ClassLevelFormData = z.infer<typeof classLevelSchema>;

export const classArmSchema = z.object({
  name: z.string().min(1, "Arm name is required"),
  classId: z.string().min(1, "Class is required"),
});

export type ClassArmFormData = z.infer<typeof classArmSchema>;

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

// CA Schemas
export const caConfigSchema = z.object({
  name: z.string().min(1, "CA name is required"),
  weight: z.number().min(1).max(100, "Weight must be between 1 and 100"),
  maxScore: z.number().min(1, "Max score must be at least 1"),
});

export type CAConfigFormData = z.infer<typeof caConfigSchema>;

export const caScoreSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  caConfigId: z.string().min(1, "CA config is required"),
  score: z.number().min(0, "Score cannot be negative"),
  termId: z.string().min(1, "Term is required"),
});

export type CAScoreFormData = z.infer<typeof caScoreSchema>;

// Exam Schemas
export const examTimetableSchema = z.object({
  termId: z.string().min(1, "Term is required"),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().min(1, "Venue is required"),
});

export type ExamTimetableFormData = z.infer<typeof examTimetableSchema>;

export const examScoreSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  termId: z.string().min(1, "Term is required"),
  score: z.number().min(0, "Score cannot be negative"),
  maxScore: z.number().min(1, "Max score must be at least 1"),
});

export type ExamScoreFormData = z.infer<typeof examScoreSchema>;

// Finance Schemas
export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0, "Amount cannot be negative"),
});

export const invoiceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  termId: z.string().min(1, "Term is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(1, "Amount must be at least 1"),
  paymentMethod: z.enum(["cash", "bank-transfer", "card", "online"]),
  reference: z.string().min(1, "Reference is required"),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Attendance Schema
export const attendanceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["present", "absent", "late", "excused"]),
  period: z.number().optional(),
  notes: z.string().optional(),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

// Staff Schemas
export const staffSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  role: z.enum(["school-admin", "teacher", "finance-officer"]),
  department: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional(),
});

export type StaffFormData = z.infer<typeof staffSchema>;

export const leaveRequestSchema = z.object({
  type: z.enum(["annual", "sick", "maternity", "paternity", "unpaid"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Please provide a reason (min 10 characters)"),
});

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

// Communication Schemas
export const messageSchema = z.object({
  recipientIds: z
    .array(z.string())
    .min(1, "At least one recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Message content is required"),
});

export type MessageFormData = z.infer<typeof messageSchema>;

// Discipline Schema
export const disciplineIncidentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  type: z.enum(["minor", "major", "severe"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
});

export type DisciplineIncidentFormData = z.infer<
  typeof disciplineIncidentSchema
>;

export const sanctionSchema = z.object({
  type: z.enum(["warning", "detention", "suspension", "expulsion"]),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

export type SanctionFormData = z.infer<typeof sanctionSchema>;

// Entrance Exam Schemas
export const entranceExamSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  date: z.string().min(1, "Date is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  totalQuestions: z.number().min(1, "Must have at least 1 question"),
  passingScore: z.number().min(1, "Passing score is required"),
});

export type EntranceExamFormData = z.infer<typeof entranceExamSchema>;

// Grading Schema
export const gradeSchema = z.object({
  letter: z.string().min(1, "Grade letter is required"),
  minScore: z.number().min(0, "Min score cannot be negative"),
  maxScore: z.number().min(1, "Max score must be at least 1"),
  gpa: z.number().min(0).max(5, "GPA must be between 0 and 5"),
  remark: z.string().min(1, "Remark is required"),
});

export const gradingSystemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  grades: z.array(gradeSchema).min(1, "At least one grade is required"),
});

export type GradingSystemFormData = z.infer<typeof gradingSystemSchema>;
