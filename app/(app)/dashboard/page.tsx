"use client";

import { useAuth } from "@/providers/app-auth-provider";
import SuperAdminDashboard from "@/components/dashboards/super-admin-dashboard";
import ParentDashboard from "@/components/dashboards/parent-dashboard";
import StudentDashboard from "@/components/dashboards/student-dashboard";
import TenantDashboard from "@/components/dashboards/tenant-dashboard";

export default function DashboardPage() {
  const { activePersona } = useAuth();

  switch (activePersona) {
    case "SYSTEM":
      return <SuperAdminDashboard />;
    case "GUARDIAN":
      return <ParentDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    case "ADMIN":
    case "STAFF":
      return <TenantDashboard />;
    default:
      return <div>Loading Dashboard...</div>;
  }
}
