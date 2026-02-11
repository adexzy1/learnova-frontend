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
  GET_CLASS_BY_ID: "/academics/class/:id",
  CREATE_CLASS: "/academics/class",
  CREATE_CLASS_ARM: "/academics/class/arm",
  UPDATE_CLASS: "/academics/class/:id",
  DELETE_CLASS: "/academics/class/:id",
  DELETE_CLASS_ARM: "/academics/class/arm/:id",
};
