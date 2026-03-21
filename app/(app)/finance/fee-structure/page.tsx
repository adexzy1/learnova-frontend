"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <CardContent className="pt-6">
          {error ? (
            <p className="text-sm text-destructive py-4 text-center">
              Failed to load fee structures. Please try again.
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
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
