"use client";
import SuperAdminDashboard from "@/components/dashboards/super-admin-dashboard";
import ParentDashboard from "@/components/dashboards/parent-dashboard";
import { ChildSelectorProvider } from "@/app/(app)/parent/ChildSelectorContext";
import StudentDashboard from "@/components/dashboards/student-dashboard";
import TenantDashboard from "@/components/dashboards/tenant-dashboard";
import { useAuth } from "@/providers";

export default function DashboardPage() {
  const { activePersona } = useAuth();

  switch (activePersona) {
    case "SYSTEM":
      return <SuperAdminDashboard />;
    case "GUARDIAN":
      return (
        <ChildSelectorProvider>
          <ParentDashboard />
        </ChildSelectorProvider>
      );
    case "STUDENT":
      return <StudentDashboard />;
    case "ADMIN":
    case "STAFF":
      return <TenantDashboard />;
    default:
      return <div>Loading Dashboard...</div>;
  }
}
