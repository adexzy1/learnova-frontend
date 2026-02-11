"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import type { ClassLevel } from "@/types";
import axiosClient from "@/lib/axios-client";
import { CLASS_ENDPOINTS } from "@/lib/api-routes";
import { AxiosResponse } from "axios";
import { queryKeys } from "@/app/constants/queryKeys";
import { ClassLevelDialog } from "./_components/class-level-dialog";
import { ClassCard } from "./_components/class-card";
import { useClassLevel } from "./_hooks/useClassLevel";

export default function ClassesPage() {
  const {
    classDialogOpen,
    setClassDialogOpen,
    editingClass,
    handleEditClass,
    handleCreateClass,
  } = useClassLevel();

  const { data: classesResponse, isLoading } = useQuery<
    AxiosResponse<ClassLevel[]>
  >({
    queryKey: [queryKeys.CLASSES],
    queryFn: async () => axiosClient.get(CLASS_ENDPOINTS.GET_ALL_CLASSES),
  });

  const classes = classesResponse?.data || [];
  console.log(classes);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage school class levels and arms."
        actions={
          <Button onClick={handleCreateClass}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        }
      />

      <ClassLevelDialog
        open={classDialogOpen}
        onOpenChange={setClassDialogOpen}
        editingClass={editingClass}
      />

      {/* Classes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes?.map((classLevel) => (
          <ClassCard
            key={classLevel.id}
            classLevel={classLevel}
            onEdit={handleEditClass}
          />
        ))}
      </div>

      {(!classes || classes.length === 0) && (
        <Card className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No classes yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Get started by creating your first class level.
            </p>
            <Button onClick={() => setClassDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Class Level
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
