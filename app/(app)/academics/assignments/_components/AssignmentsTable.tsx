"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import type { SubjectAssignment } from "@/types";
import type { UseMutationResult } from "@tanstack/react-query";

interface AssignmentsTableProps {
  assignments: SubjectAssignment[];
  deleteMutation: UseMutationResult<unknown, unknown, string>;
}

export function AssignmentsTable({ assignments, deleteMutation }: AssignmentsTableProps) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SubjectAssignment | null>(null);

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.teacherName.toLowerCase().includes(q) ||
      a.subjectName.toLowerCase().includes(q) ||
      a.classArmName.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search by teacher, subject, or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher Name</TableHead>
            <TableHead>Subject Name</TableHead>
            <TableHead>Class Arm</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                {search ? "No assignments match your search." : "No assignments found. Assign a subject to get started."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.teacherName}</TableCell>
                <TableCell>{assignment.subjectName}</TableCell>
                <TableCell>{assignment.classArmName}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(assignment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the assignment of{" "}
              <strong>{deleteTarget?.subjectName}</strong> to{" "}
              <strong>{deleteTarget?.teacherName}</strong> for{" "}
              <strong>{deleteTarget?.classArmName}</strong>? This action cannot be undone.
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
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
