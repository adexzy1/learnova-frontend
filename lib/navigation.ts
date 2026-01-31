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
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  permission?: string | string[]
  badge?: number
  children?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// Tenant navigation (school-specific)
export const tenantNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
      },
    ],
  },
  {
    title: 'People',
    items: [
      {
        title: 'Students',
        href: '/students',
        icon: GraduationCap,
        permission: 'students.view',
      },
      {
        title: 'Admissions',
        href: '/admissions',
        icon: Users,
        permission: 'students.create',
      },
      {
        title: 'Staff',
        href: '/staff',
        icon: UserCog,
        permission: 'staff.view',
      },
    ],
  },
  {
    title: 'Academics',
    items: [
      {
        title: 'Academic Setup',
        href: '/academics',
        icon: BookOpen,
        permission: 'academics.view',
        children: [
          { title: 'Sessions', href: '/academics/sessions', icon: Calendar, permission: 'academics.view' },
          { title: 'Terms', href: '/academics/terms', icon: Calendar, permission: 'academics.view' },
          { title: 'Classes', href: '/academics/classes', icon: Users, permission: 'academics.view' },
          { title: 'Subjects', href: '/academics/subjects', icon: BookOpen, permission: 'academics.view' },
          { title: 'Grading', href: '/academics/grading', icon: FileText, permission: 'academics.view' },
        ],
      },
      {
        title: 'Assessments',
        href: '/assessments',
        icon: ClipboardCheck,
        permission: 'assessments.view',
        children: [
          { title: 'CA Entry', href: '/assessments/ca', icon: ClipboardCheck, permission: 'assessments.manage' },
          { title: 'Exam Entry', href: '/assessments/exams', icon: FileText, permission: 'assessments.manage' },
          { title: 'Timetable', href: '/assessments/timetable', icon: Calendar, permission: 'assessments.view' },
        ],
      },
      {
        title: 'Results',
        href: '/results',
        icon: FileText,
        permission: 'results.view',
      },
      {
        title: 'Attendance',
        href: '/attendance',
        icon: Calendar,
        permission: 'attendance.view',
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Invoices',
        href: '/finance/invoices',
        icon: CreditCard,
        permission: 'finance.view',
      },
      {
        title: 'Payments',
        href: '/finance/payments',
        icon: CreditCard,
        permission: 'finance.view',
      },
      {
        title: 'Ledger',
        href: '/finance/ledger',
        icon: ScrollText,
        permission: 'finance.manage',
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        title: 'Messages',
        href: '/communications/messages',
        icon: MessageSquare,
        permission: 'communications.view',
      },
      {
        title: 'Discipline',
        href: '/discipline',
        icon: AlertTriangle,
        permission: 'students.view',
      },
    ],
  },
  {
    title: 'Reports',
    items: [
      {
        title: 'Analytics',
        href: '/reports',
        icon: BarChart3,
        permission: 'reports.view',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        permission: 'settings.view',
      },
    ],
  },
]

// Parent portal navigation
export const parentNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/parent',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
      },
    ],
  },
  {
    title: 'My Children',
    items: [
      {
        title: 'Children',
        href: '/parent/children',
        icon: Users,
        permission: 'children.view',
      },
      {
        title: 'Results',
        href: '/parent/results',
        icon: FileText,
        permission: 'results.view',
      },
      {
        title: 'Attendance',
        href: '/parent/attendance',
        icon: Calendar,
        permission: 'attendance.view',
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Payments',
        href: '/parent/payments',
        icon: CreditCard,
        permission: 'finance.view',
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        title: 'Messages',
        href: '/parent/messages',
        icon: MessageSquare,
        permission: 'communications.view',
      },
    ],
  },
]

// Student portal navigation
export const studentNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/student',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
      },
    ],
  },
  {
    title: 'Academics',
    items: [
      {
        title: 'My Results',
        href: '/student/results',
        icon: FileText,
        permission: 'results.view',
      },
      {
        title: 'Attendance',
        href: '/student/attendance',
        icon: Calendar,
        permission: 'attendance.view',
      },
      {
        title: 'Exams',
        href: '/student/exams',
        icon: ClipboardCheck,
        permission: 'exams.take',
      },
    ],
  },
]

// Super admin navigation
export const superAdminNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/super-admin',
        icon: LayoutDashboard,
        permission: 'tenants.view',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Schools',
        href: '/super-admin/schools',
        icon: Building2,
        permission: 'tenants.view',
      },
      {
        title: 'Onboarding',
        href: '/super-admin/onboarding',
        icon: Users,
        permission: 'tenants.create',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Audit Logs',
        href: '/super-admin/audit',
        icon: ScrollText,
        permission: 'audit.view',
      },
      {
        title: 'Configuration',
        href: '/super-admin/config',
        icon: Settings,
        permission: 'system.manage',
      },
      {
        title: 'Security',
        href: '/super-admin/security',
        icon: Shield,
        permission: 'system.manage',
      },
    ],
  },
]
