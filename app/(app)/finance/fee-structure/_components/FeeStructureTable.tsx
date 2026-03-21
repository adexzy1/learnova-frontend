"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { formatCurrency } from "@/lib/format";
import type { FeeStructure } from "@/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { FeeStructureDialog } from "./FeeStructureDialog";
import type { FeeStructurePayload } from "../_service/useFeeStructureService";

interface FeeStructureTableProps {
  feeStructures: FeeStructure[];
  createMutation: UseMutationResult<unknown, unknown, FeeStructurePayload>;
  updateMutation: UseMutationResult<unknown, unknown, FeeStructurePayload & { id: string }>;
  deleteMutation: UseMutationResult<unknown, unknown, string>;
}

export function FeeStructureTable({
  feeStructures,
  createMutation,
  updateMutation,
  deleteMutation,
}: FeeStructureTableProps) {
  const [editTarget, setEditTarget] = useState<FeeStructure | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeStructure | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Applicable Classes</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feeStructures.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No fee structures found. Add one to get started.
              </TableCell>
            </TableRow>
          ) : (
            feeStructures.map((fs) => (
              <TableRow key={fs.id}>
                <TableCell className="font-medium">{fs.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {fs.description || "—"}
                </TableCell>
                <TableCell>
                  {fs.applicableClasses.length === 0 ? (
                    <Badge variant="secondary">All Classes</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {fs.applicableClasses.map((cls) => (
                        <Badge key={cls} variant="outline" className="text-xs">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(fs.amount)}
                </TableCell>
                <TableCell>
                  {fs.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(fs)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(fs)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <FeeStructureDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        initialData={editTarget}
        createMutation={createMutation}
        updateMutation={updateMutation}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
