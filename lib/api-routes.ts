export const ROLES_ENDPOINTS = {
  GET_ALL_ROLES: "/roles",
  GET_ROLE_BY_ID: "/roles/:id",
  CREATE_ROLE: "/roles",
  UPDATE_ROLE: "/roles/:id",
  DELETE_ROLE: "/roles/:id",
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
  GET_ALL_CLASSES: "/academics/class",
  GET_ALL_CLASS_ARMS: "/academics/class/arm",
  GET_CLASS_BY_ID: "/academics/class/:id",
  CREATE_CLASS: "/academics/class",
  CREATE_CLASS_ARM: "/academics/class/arm",
  UPDATE_CLASS: "/academics/class/:id",
  DELETE_CLASS: "/academics/class/:id",
  DELETE_CLASS_ARM: "/academics/class/arm/:id",
};

export const SUBJECT_ENDPOINTS = {
  GET_ALL_SUBJECTS: "/academics/subject",
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

export const TENANT_ENDPOINTS = {
  GET_TENANT_BY_ID: "/tenant/:id",
  GET_ALL_TENANTS: "/tenant",
  CREATE_TENANT: "/tenant",
  UPDATE_TENANT: "/tenant/:id",
  DELETE_TENANT: "/tenant/:id",
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
  INIT_PAYMENT: "/subscription/payment/initialize",
  VERIFY_PAYMENT: "/subscription/payment/verify",
  GET_BILLING_HISTORY: "/subscription/billing",
};
