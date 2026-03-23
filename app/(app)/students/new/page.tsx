"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StudentForm } from "../_components/student-form";
import { useNewStudentService } from "../_service/useNewStudentService";

export default function NewStudentPage() {
  const { mutation, isLoading, form } = useNewStudentService();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Student"
        description="Register a new student in the system"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Students", href: "/students" },
          { label: "New Student" },
        ]}
      />

      <StudentForm
        title="Student Registration"
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={isLoading}
        form={form}
      />
    </div>
  );
}
