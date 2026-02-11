import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  CreditCard,
  Calendar,
  UserCog,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Settings,
  Building2,
  Shield,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PERMISSIONS } from "../app/constants/permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string | string[];
  badge?: number;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Tenant navigation (school-specific)
export const tenantNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: [PERMISSIONS.PORTAL_STAFF, PERMISSIONS.PORTAL_ADMIN],
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        title: "Students",
        href: "/students",
        icon: GraduationCap,
        permission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ACADEMIC_MANAGE],
      },
      {
        title: "Admissions",
        href: "/admissions",
        icon: Users,
        permission: PERMISSIONS.ACADEMIC_MANAGE,
      },
      {
        title: "Staff",
        href: "/staff",
        icon: UserCog,
        permission: PERMISSIONS.IDENTITY_MANAGE,
      },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        title: "Academic Setup",
        href: "/academics",
        icon: BookOpen,
        permission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ACADEMIC_MANAGE],
        children: [
          {
            title: "Sessions",
            href: "/academics/sessions",
            icon: Calendar,
            permission: [
              PERMISSIONS.ACADEMIC_VIEW,
              PERMISSIONS.ACADEMIC_MANAGE,
            ],
          },
          {
            title: "Terms",
            href: "/academics/terms",
            icon: Calendar,
            permission: [
              PERMISSIONS.ACADEMIC_VIEW,
              PERMISSIONS.ACADEMIC_MANAGE,
            ],
          },
          {
            title: "Classes",
            href: "/academics/classes",
            icon: Users,
            permission: [
              PERMISSIONS.ACADEMIC_VIEW,
              PERMISSIONS.ACADEMIC_MANAGE,
            ],
          },
          {
            title: "Subjects",
            href: "/academics/subjects",
            icon: BookOpen,
            permission: [
              PERMISSIONS.ACADEMIC_VIEW,
              PERMISSIONS.ACADEMIC_MANAGE,
            ],
          },
          {
            title: "Grading",
            href: "/academics/grading",
            icon: FileText,
            permission: [
              PERMISSIONS.ACADEMIC_VIEW,
              PERMISSIONS.ACADEMIC_MANAGE,
            ],
          },
        ],
      },
      {
        title: "Assessments",
        href: "/assessments",
        icon: ClipboardCheck,
        permission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ACADEMIC_MANAGE],
        children: [
          {
            title: "CA Entry",
            href: "/assessments/ca",
            icon: ClipboardCheck,
            permission: PERMISSIONS.ACADEMIC_MANAGE,
          },
          {
            title: "Exam Entry",
            href: "/assessments/exams",
            icon: FileText,
            permission: PERMISSIONS.ACADEMIC_MANAGE,
          },
          {
            title: "Timetable",
            href: "/assessments/timetable",
            icon: Calendar,
            permission: [
              PERMISSIONS.ACADEMIC_VIEW,
              PERMISSIONS.ACADEMIC_MANAGE,
            ],
          },
        ],
      },
      {
        title: "Results",
        href: "/results",
        icon: FileText,
        permission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ACADEMIC_MANAGE],
      },
      {
        title: "Attendance",
        href: "/attendance",
        icon: Calendar,
        permission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ACADEMIC_MANAGE],
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Invoices",
        href: "/finance/invoices",
        icon: CreditCard,
        permission: [PERMISSIONS.FINANCE_VIEW, PERMISSIONS.FINANCE_MANAGE],
      },
      {
        title: "Payments",
        href: "/finance/payments",
        icon: CreditCard,
        permission: [PERMISSIONS.FINANCE_VIEW, PERMISSIONS.FINANCE_MANAGE],
      },
      {
        title: "Ledger",
        href: "/finance/ledger",
        icon: ScrollText,
        permission: PERMISSIONS.FINANCE_MANAGE,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/communications/messages",
        icon: MessageSquare,
        permission: PERMISSIONS.COMMUNICATION_SEND,
      },
      {
        title: "Discipline",
        href: "/discipline",
        icon: AlertTriangle,
        permission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ACADEMIC_MANAGE],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Analytics",
        href: "/reports",
        icon: BarChart3,
        permission: PERMISSIONS.ACADEMIC_VIEW,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
    ],
  },
];

// Parent portal navigation
export const parentNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/parent",
        icon: LayoutDashboard,
        permission: PERMISSIONS.PORTAL_GUARDIAN,
      },
    ],
  },
  {
    title: "My Children",
    items: [
      {
        title: "Children",
        href: "/parent/children",
        icon: Users,
        permission: PERMISSIONS.PORTAL_GUARDIAN,
      },
      {
        title: "Results",
        href: "/parent/results",
        icon: FileText,
        permission: PERMISSIONS.PORTAL_GUARDIAN,
      },
      {
        title: "Attendance",
        href: "/parent/attendance",
        icon: Calendar,
        permission: PERMISSIONS.PORTAL_GUARDIAN,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Payments",
        href: "/parent/payments",
        icon: CreditCard,
        permission: PERMISSIONS.PORTAL_GUARDIAN,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/parent/messages",
        icon: MessageSquare,
        permission: PERMISSIONS.PORTAL_GUARDIAN,
      },
    ],
  },
];

// Student portal navigation
export const studentNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/student",
        icon: LayoutDashboard,
        permission: PERMISSIONS.PORTAL_STUDENT,
      },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        title: "My Results",
        href: "/student/results",
        icon: FileText,
        permission: PERMISSIONS.PORTAL_STUDENT,
      },
      {
        title: "Attendance",
        href: "/student/attendance",
        icon: Calendar,
        permission: PERMISSIONS.PORTAL_STUDENT,
      },
      {
        title: "Exams",
        href: "/student/exams",
        icon: ClipboardCheck,
        permission: PERMISSIONS.PORTAL_STUDENT,
      },
    ],
  },
];

// Super admin navigation
export const superAdminNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/super-admin",
        icon: LayoutDashboard,
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Schools",
        href: "/super-admin/schools",
        icon: Building2,
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
      {
        title: "Onboarding",
        href: "/super-admin/onboarding",
        icon: Users,
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Audit Logs",
        href: "/super-admin/audit",
        icon: ScrollText,
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
      {
        title: "Configuration",
        href: "/super-admin/config",
        icon: Settings,
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
      {
        title: "Security",
        href: "/super-admin/security",
        icon: Shield,
        permission: PERMISSIONS.SYSTEM_SETTINGS,
      },
    ],
  },
];
