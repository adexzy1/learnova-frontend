"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

import useAssignmentsService from "./_service/useAssignmentsService";
import { AssignmentsTable } from "./_components/AssignmentsTable";
import { AssignDialog } from "./_components/AssignDialog";

export default function AssignmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    assignments,
    teachers,
    subjects,
    classArms,
    isLoading,
    error,
    createMutation,
    deleteMutation,
  } = useAssignmentsService();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject Assignments"
        description="Manage subject-teacher-class assignments"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics", href: "/academics" },
          { label: "Subject Assignments" },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Assign Subject
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {error ? (
            <p className="text-sm text-destructive py-4 text-center">
              Failed to load assignments. Please try again.
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <AssignmentsTable assignments={assignments} deleteMutation={deleteMutation} />
          )}
        </CardContent>
      </Card>

      <AssignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teachers={teachers}
        subjects={subjects}
        classArms={classArms}
        assignments={assignments}
        createMutation={createMutation}
      />
    </div>
  );
}
