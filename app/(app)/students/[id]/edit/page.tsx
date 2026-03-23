"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StudentForm } from "../../_components/student-form";
import { useEditStudentService } from "../../_service/useEditStudentService";

export default function EditStudentPage() {
  const { studentDetails, isLoadingDetails, mutation, isLoading, form } =
    useEditStudentService();

  console.log(studentDetails);

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
        <Button asChild variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Student"
        description="Modify student profile information"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students", href: "/students" },
          {
            label: studentDetails
              ? `${studentDetails.firstName} ${studentDetails.lastName}`
              : "Profile",
            href: `/students/${studentDetails?.id}`,
          },
          { label: "Edit" },
        ]}
      />

      <StudentForm
        title="Edit Profile"
        initialData={studentDetails}
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={isLoading}
        form={form}
      />
    </div>
  );
}
