export const PERMISSIONS = {
  // Portal Access
  PORTAL_STAFF: "portal.staff",
  PORTAL_GUARDIAN: "portal.guardian",
  PORTAL_STUDENT: "portal.student",
  PORTAL_ADMIN: "portal.admin",

  // Academic Scopes
  ACADEMIC_VIEW: "academic.view",
  ACADEMIC_MANAGE: "academic.manage",

  // Finance Scopes
  FINANCE_VIEW: "finance.view",
  FINANCE_MANAGE: "finance.manage",

  // Identity & Management
  IDENTITY_MANAGE: "identity.manage",
  SYSTEM_SETTINGS: "system.settings",
  COMMUNICATION_SEND: "communication.send",

  // super admin
  APP_MANAGE: "app.manage",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const PERMISSION_META: Record<
  string,
  { label: string; description: string }
> = {
  [PERMISSIONS.PORTAL_STAFF]: {
    label: "Staff Portal Access",
    description: "Basic access to the staff dashboard and core features.",
  },
  [PERMISSIONS.PORTAL_ADMIN]: {
    label: "Admin Portal Access",
    description: "Access to the admin portal to manage school data.",
  },
  [PERMISSIONS.PORTAL_GUARDIAN]: {
    label: "Guardian Portal Access",
    description: "Access to the parent/guardian portal to view children data.",
  },
  [PERMISSIONS.PORTAL_STUDENT]: {
    label: "Student Portal Access",
    description: "Access to the student portal to view personal academic data.",
  },

  // Academic
  [PERMISSIONS.ACADEMIC_VIEW]: {
    label: "View Academic Data",
    description: "Can view students, classes, sessions, and academic records.",
  },
  [PERMISSIONS.ACADEMIC_MANAGE]: {
    label: "Manage Academics",
    description: "Can create and edit classes, sessions, and student profiles.",
  },

  // Finance
  [PERMISSIONS.FINANCE_VIEW]: {
    label: "View Finance",
    description: "Can view fee structures, invoices, and payments.",
  },
  [PERMISSIONS.FINANCE_MANAGE]: {
    label: "Manage Finance",
    description: "Can configure fees and manage school revenue.",
  },

  // Identity
  [PERMISSIONS.IDENTITY_MANAGE]: {
    label: "Manage Identity",
    description: "Can manage staff, users, roles, and permissions.",
  },

  // System
  [PERMISSIONS.SYSTEM_SETTINGS]: {
    label: "System Settings",
    description: "Can update school profile, branding, and system configs.",
  },

  // Communication
  [PERMISSIONS.COMMUNICATION_SEND]: {
    label: "Send Communication",
    description: "Can send school-wide broadcast messages and notifications.",
  },
};

export const PERMISSION_GROUPS = [
  {
    name: "Portals",
    permissions: [
      PERMISSIONS.PORTAL_STAFF,
      PERMISSIONS.PORTAL_GUARDIAN,
      PERMISSIONS.PORTAL_STUDENT,
      PERMISSIONS.PORTAL_ADMIN,
    ],
  },
  {
    name: "Academic",
    permissions: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ACADEMIC_MANAGE],
  },
  {
    name: "Finance",
    permissions: [PERMISSIONS.FINANCE_VIEW, PERMISSIONS.FINANCE_MANAGE],
  },
  {
    name: "Identity & System",
    permissions: [
      PERMISSIONS.IDENTITY_MANAGE,
      PERMISSIONS.SYSTEM_SETTINGS,
      PERMISSIONS.COMMUNICATION_SEND,
    ],
  },
];
