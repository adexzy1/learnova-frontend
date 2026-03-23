"use client";

import { useState } from "react";
import { Plus, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

import useFeeStructureService from "./_service/useFeeStructureService";
import { FeeStructureTable } from "./_components/FeeStructureTable";
import { FeeStructureDialog } from "./_components/FeeStructureDialog";

export default function FeeStructurePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { feeStructures, isLoading, error, createMutation, updateMutation, deleteMutation } =
    useFeeStructureService();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structure"
        description="Manage fee structures for your school"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Fee Structure" },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Fee Structure
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>
            {feeStructures.length > 0
              ? `${feeStructures.length} fee structure${feeStructures.length > 1 ? "s" : ""} configured`
              : "Configure the fees applicable to your students"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-destructive">
                Failed to load fee structures. Please try again.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : feeStructures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Landmark className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No fee structures yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first fee structure to start billing students
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Fee Structure
              </Button>
            </div>
          ) : (
            <FeeStructureTable
              feeStructures={feeStructures}
              createMutation={createMutation}
              updateMutation={updateMutation}
              deleteMutation={deleteMutation}
            />
          )}
        </CardContent>
      </Card>

      <FeeStructureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        createMutation={createMutation}
        updateMutation={updateMutation}
      />
    </div>
  );
}
