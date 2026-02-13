"use client";

import { Pencil, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StudentDetails } from "../_components/student-details";
import { useEditStudentService } from "../_service/useEditStudentService";

export default function StudentProfilePage() {
  const { studentDetails, isLoadingDetails } = useEditStudentService();

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Student record not found.</p>
        <Button asChild variant="outline">
          <Link href="/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${studentDetails.firstName} ${studentDetails.lastName}`}
        description={`Student Profile - ${studentDetails.admissionNumber}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students", href: "/students" },
          { label: "Profile" },
        ]}
        actions={
          <Button asChild>
            <Link href={`/students/${studentDetails.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        }
      />

      <StudentDetails student={studentDetails} />
    </div>
  );
}
