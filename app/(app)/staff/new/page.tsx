"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StaffForm } from "../_components/staff-form";
import { useNewStaffService } from "../_service/useNewStaffService";

export default function NewStaffPage() {
  const { mutation, isLoading, form } = useNewStaffService();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Staff"
        description="Register a new staff member in the system"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff", href: "/staff" },
          { label: "New Staff" },
        ]}
      />

      <StaffForm
        title="Staff Registration"
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={isLoading}
        form={form}
        submitLabel="Register Staff"
      />
    </div>
  );
}
