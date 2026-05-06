export const ROLES_ENDPOINTS = {
  GET_ALL_ROLES: "/roles",
  GET_ROLE_BY_ID: "/roles/:id",
  CREATE_ROLE: "/roles",
  UPDATE_ROLE: "/roles/:id",
  DELETE_ROLE: "/roles/:id",
  GET_SELECTABLE_ROLES: "/roles/select",
};
export const TENANT_SETTINGS_ENDPOINTS = {
  GET_TENANT_SETTINGS: "/settings",
  UPDATE_SCHOOL_PROFILE: "/settings/school-profile",
  UPDATE_ACADEMIC_YEAR: "/settings/academic-year",
  UPDATE_BRANDING: "/settings/branding",
  UPDATE_ACADEMIC_CONFIGURATION: "/settings/academic-configuration",
  UPDATE_NOTIFICATION_PREFERENCES: "/settings/notification-preferences",
};

export const SESSION_ENDPOINTS = {
  GET_ALL_SESSIONS: "/academics/session",
  GET_SELECTABLE_SESSIONS: "/academics/session/select",
  GET_SESSION_BY_ID: "/academics/session/:id",
  CREATE_SESSION: "/academics/session",
  UPDATE_SESSION: "/academics/session/:id",
  DELETE_SESSION: "/academics/session/:id",
  SETUP_ACADEMIC_YEAR: "/academics/session/setup",
};

export const TERM_ENDPOINTS = {
  GET_ALL_TERMS: "/academics/term",
  GET_TERM_BY_ID: "/academics/term/:id",
  CREATE_TERM: "/academics/term",
  UPDATE_TERM: "/academics/term/:id",
  DELETE_TERM: "/academics/term/:id",
  GET_SELECTABLE_TERMS: "/academics/term/select",
};

export const CLASS_ENDPOINTS = {
  SETUP_CLASS_STRUCTURE: "/academics/class/setup",
  GET_ALL_CLASSES: "/academics/class",
  GET_SELECTABLE_CLASSES: "/academics/class/select",
  GET_ALL_CLASS_ARMS: "/academics/class/arm",
  GET_CLASS_BY_ID: "/academics/class/:id",
  CREATE_CLASS: "/academics/class",
  CREATE_CLASS_ARM: "/academics/class/arm",
  UPDATE_CLASS: "/academics/class/:id",
  DELETE_CLASS: "/academics/class/:id",
  DELETE_CLASS_ARM: "/academics/class/arm/:id",
  // Subject-Teacher Assignments
  ASSIGN_SUBJECT_TEACHER: "/academics/class/subject-teachers",
  GET_SUBJECT_TEACHERS_BY_STAFF:
    "/academics/class/subject-teachers/staff/:staffId",
  GET_SUBJECT_TEACHERS_BY_CLASS_ARM:
    "/academics/class/subject-teachers/class-arm/:classArmId",
  REMOVE_SUBJECT_TEACHER: "/academics/class/subject-teachers/:id",
};

export const SUBJECT_ENDPOINTS = {
  GET_ALL_SUBJECTS: "/academics/subject",
  GET_SELECTABLE_SUBJECTS: "/academics/subject/select",
  GET_SUBJECT_BY_ID: "/academics/subject/:id",
  CREATE_SUBJECT: "/academics/subject",
  UPDATE_SUBJECT: "/academics/subject/:id",
  DELETE_SUBJECT: "/academics/subject/:id",
};

export const STUDENT_ENDPOINTS = {
  GET_ALL_STUDENTS: "/people/students",
  GET_STUDENT_BY_ID: "/people/students/:id",
  CREATE_STUDENT: "/people/students",
  UPDATE_STUDENT: "/people/students/:id",
  DELETE_STUDENT: "/people/students/:id",
};

export const STAFF_ENDPOINTS = {
  GET_ALL_STAFF: "/people/staff",
  GET_STAFF_BY_ID: "/people/staff/:id",
  CREATE_STAFF: "/people/staff",
  UPDATE_STAFF: "/people/staff/:id",
  DEACTIVATE_STAFF: "/people/staff/:id/deactivate",
};

export const TENANT_ENDPOINTS = {
  GET_TENANT_BY_ID: "/tenant/:id",
  GET_ALL_TENANTS: "/tenant",
  CREATE_TENANT: "/tenant",
  UPDATE_TENANT: "/tenant/:id",
  DELETE_TENANT: "/tenant/:id",
  GET_STATS: "/tenant/stats",
  GET_ANALYTICS: "/tenant/analytics",
  GET_TENANT_USERS: "/tenant/:id/users",
};

export const PLAN_ENDPOINTS = {
  GET_ALL_PLANS: "/subscription/plan",
  GET_PLAN_BY_ID: "/subscription/plan/:id",
  CREATE_PLAN: "/subscription/plan",
  UPDATE_PLAN: "/subscription/plan/:id",
  DELETE_PLAN: "/subscription/plan/:id",
};

export const SUBSCRIPTION_ENDPOINTS = {
  GET_SUBSCRIPTION: "/subscription",
  GET_PLANS: "/subscription/plan",
  CHANGE_PLAN: "/subscription/change-plan",
  INIT_PAYMENT: "/subscription/initialize-payment",
  VERIFY_PAYMENT: "/subscription/payment/verify",
  GET_BILLING_HISTORY: "/subscription/billing",
};

export const ONBOARDING_ENDPOINTS = {
  CHANGE_DEFAULT_PASSWORD: "/onboarding/change-default-password",
  SET_PAYMENT_METHOD: "/onboarding/payment-method",
  VERIFY_PAYMENT: "/onboarding/verify-payment",
};

export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  SESSION: "/auth/session",
  REFRESH: "/auth/refresh",
  SWITCH_PERSONA: "/auth/switch-persona",
};

export const GRADING_ENDPOINTS = {
  GET_ALL: "/academics/grading-system",
  SETUP_GRADING_SYSTEM: "/academics/grading-system/setup",
  GET_BY_ID: "/academics/grading-system/:id",
  CREATE: "/academics/grading-system",
  UPDATE: "/academics/grading-system/:id",
  DELETE: "/academics/grading-system/:id",
  SET_DEFAULT: "/academics/grading-system/:id/set-default",
};

export const ASSESSMENT_ENDPOINTS = {
  CA_CONFIGS_GET: "/academics/assessment/ca-configs",
  CA_CONFIGS_CREATE: "/academics/assessment/ca-configs",
  CA_CONFIGS_UPDATE: "/academics/assessment/ca-configs/:id",
  CA_CONFIGS_DELETE: "/academics/assessment/ca-configs/:id",
  CA_SCORES_GET: "/academics/assessment/ca",
  CA_SCORES_SAVE: "/academics/assessment/ca",
  EXAM_SCORES_GET: "/academics/assessment/exam",
  EXAM_SCORES_SAVE: "/academics/assessment/exam",
  EXAMINATIONS_GET: "/academics/assessment/examinations",
  EXAMINATIONS_CREATE: "/academics/assessment/examinations",
  EXAMINATIONS_UPDATE: "/academics/assessment/examinations/:id",
  EXAM_TIMETABLE_GET: "/academics/assessment/exam-timetable",
  EXAM_TIMETABLE_CREATE: "/academics/assessment/exam-timetable",
};

export const TIMETABLE_ENDPOINTS = {
  GET: "/academics/timetable",
  CREATE: "/academics/timetable",
  UPDATE: "/academics/timetable/:id",
  DELETE: "/academics/timetable/:id",
  COPY: "/academics/timetable/copy",
  SUBJECT_TEACHERS: "/academics/timetable/subject-teachers",
};

export const ATTENDANCE_ENDPOINTS = {
  GET_BY_CLASS_DATE: "/academics/attendance",
  CLASS_ROSTER: "/academics/attendance/class-roster",
  SAVE: "/academics/attendance",
  GET_SUMMARY: "/academics/attendance/summary",
  GET_ALL: "/academics/attendance",
};

export const RESULTS_ENDPOINTS = {
  GET_CLASS_RESULTS: "/academics/results",
  GET_STUDENT_RESULT: "/academics/results/student/:studentId",
  PUBLISH: "/academics/results/publish",
  GET_ALL: "/academics/results",
  GET_BY_ID: "/academics/results/:id",
};

export const DISCIPLINE_ENDPOINTS = {
  GET_ALL: "/discipline",
  GET_BY_ID: "/discipline/:id",
  CREATE: "/discipline",
  UPDATE: "/discipline/:id",
  UPDATE_STATUS: "/discipline/:id/status",
  DELETE: "/discipline/:id",
};

export const ADMISSIONS_ENDPOINTS = {
  GET_ALL: "/admissions",
  GET_BY_ID: "/admissions/:id",
  CREATE: "/admissions",
  UPDATE: "/admissions/:id",
  UPDATE_STATUS: "/admissions/:id/status",
  DELETE: "/admissions/:id",
};

export const FINANCE_ENDPOINTS = {
  INVOICES_GET_ALL: "/finance/invoices",
  INVOICES_GET_BY_ID: "/finance/invoices/:id",
  INVOICES_CREATE: "/finance/invoices",
  INVOICES_GENERATE: "/finance/invoices/generate",
  INVOICES_UPDATE: "/finance/invoices/:id",
  INVOICES_DELETE: "/finance/invoices/:id",
  INVOICES_STATS: "/finance/invoices/stats",
  PAYMENTS_GET_ALL: "/finance/payments",
  PAYMENTS_CREATE: "/finance/payments",
  PAYMENTS_STATS: "/finance/payments/stats",
  LEDGER_GET: "/finance/ledger",
  LEDGER_STATS: "/finance/ledger/stats",
  FEE_STRUCTURES_GET_ALL: "/finance/fee-structures",
  FEE_STRUCTURES_GET_BY_ID: "/finance/fee-structures/:id",
  FEE_STRUCTURES_CREATE: "/finance/fee-structures",
  FEE_STRUCTURES_UPDATE: "/finance/fee-structures/:id",
  FEE_STRUCTURES_DELETE: "/finance/fee-structures/:id",
  INIT_PAYMENT: "/finance/invoices/:id/initialize-payment",
  INVOICES_SEND: "/finance/invoices/:id/send",
  EXPENSES_GET: "/finance/ledger",
  EXPENSES_CREATE: "/finance/ledger",
};

export const ONLINE_EXAM_ENDPOINTS = {
  LIST: "/academics/online-exams",
  GET_BY_ID: "/academics/online-exams/:id",
  START: "/academics/online-exams/:id/start",
  GET_ATTEMPT: "/academics/online-exams/:id/attempt",
  AUTOSAVE: "/academics/online-exams/:id/attempts/:attemptId/autosave",
  SUBMIT: "/academics/online-exams/:id/attempts/:attemptId/submit",
};

export const NOTIFICATIONS_ENDPOINTS = {
  GET_ALL: "/notifications",
  GET_BY_ID: "/notifications/:id",
  MARK_READ: "/notifications/:id/read",
  MARK_ALL_READ: "/notifications/mark-all-read",
};

export const REPORTS_ENDPOINTS = {
  ATTENDANCE_TREND: "/reports/attendance-trend",
  FEE_COLLECTION: "/reports/fee-collection",
  PERFORMANCE: "/reports/performance",
};

export const AUDIT_ENDPOINTS = {
  GET_ALL: "/audit",
  GET_BY_ID: "/audit/:id",
};

export const ASSIGNMENTS_ENDPOINTS = {
  GET_ALL: "/academics/assignments",
  GET_BY_ID: "/academics/assignments/:id",
  CREATE: "/academics/assignments",
  DELETE: "/academics/assignments/:id",
};

export const GUARDIAN_ENDPOINTS = {
  GET_MY_CHILDREN: "/guardians/my-children",
  GET_CHILD_STATS: "/guardians/children/:childId/stats",
};

export const DASHBOARD_ENDPOINTS = {
  CONTEXT: "/dashboard/context",
  PEOPLE: "/dashboard/people",
  ATTENDANCE: "/dashboard/attendance",
  ACADEMIC_PERFORMANCE: "/dashboard/academic-performance",
  CLASSES: "/dashboard/classes",
  FINANCE_SUMMARY: "/dashboard/finance/summary",
  FINANCE_REVENUE: "/dashboard/finance/revenue",
  FINANCE_PAYMENTS: "/dashboard/finance/payments",
  UPCOMING_EXAMS: "/dashboard/upcoming-exams",
};
