"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StaffForm } from "../../_components/staff-form";
import { useEditStaffService } from "../../_service/useEditStaffService";

export default function EditStaffPage() {
  const { staffDetails, isLoadingDetails, mutation, isLoading, form } =
    useEditStaffService();

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Staff Profile"
        description={
          staffDetails
            ? `Editing ${staffDetails.firstName} ${staffDetails.lastName}`
            : "Edit staff member details"
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff", href: "/staff" },
          ...(staffDetails
            ? [
                {
                  label: `${staffDetails.firstName} ${staffDetails.lastName}`,
                  href: `/staff/${staffDetails.id}`,
                },
              ]
            : []),
          { label: "Edit" },
        ]}
      />

      <StaffForm
        title="Update Staff Profile"
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={isLoading}
        form={form}
        submitLabel="Update Staff"
        isEdit
      />
    </div>
  );
}
