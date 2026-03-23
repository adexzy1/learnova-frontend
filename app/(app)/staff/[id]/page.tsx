"use client";

import { Pencil, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StaffDetails } from "../_components/staff-details";
import { SubjectAssignments } from "../_components/subject-assignments";
import { useEditStaffService } from "../_service/useEditStaffService";

export default function StaffProfilePage() {
  const { staffDetails, isLoadingDetails } = useEditStaffService();

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!staffDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Staff record not found.</p>
        <Button asChild variant="outline">
          <Link href="/staff">Back to Staff</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${staffDetails.firstName} ${staffDetails.lastName}`}
        description={`Staff Profile — ${staffDetails.staffNumber}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff", href: "/staff" },
          { label: "Profile" },
        ]}
        actions={
          <Button asChild>
            <Link href={`/staff/${staffDetails.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        }
      />

      <StaffDetails staff={staffDetails} />

      <SubjectAssignments staffId={staffDetails.id} />
    </div>
  );
}
