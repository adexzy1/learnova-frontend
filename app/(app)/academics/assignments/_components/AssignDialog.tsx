"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Staff, Subject, ClassArm, SubjectAssignment } from "@/types";
import type { AssignmentPayload } from "../_service/useAssignmentsService";
import type { UseMutationResult } from "@tanstack/react-query";

const assignSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  subjectId: z.string().min(1, "Subject is required"),
  classArmId: z.string().min(1, "Class arm is required"),
});

type AssignFormData = z.infer<typeof assignSchema>;

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Staff[];
  subjects: Subject[];
  classArms: ClassArm[];
  assignments: SubjectAssignment[];
  createMutation: UseMutationResult<unknown, unknown, AssignmentPayload>;
}

export function AssignDialog({
  open,
  onOpenChange,
  teachers,
  subjects,
  classArms,
  assignments,
  createMutation,
}: AssignDialogProps) {
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const form = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      teacherId: "",
      subjectId: "",
      classArmId: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setDuplicateError(null);
    }
    onOpenChange(open);
  };

  const onSubmit = (data: AssignFormData) => {
    // Client-side duplicate check: same subjectId + classArmId
    const isDuplicate = assignments.some(
      (a) => a.subjectId === data.subjectId && a.classArmId === data.classArmId,
    );

    if (isDuplicate) {
      setDuplicateError("This subject is already assigned to this class");
      return;
    }

    setDuplicateError(null);
    createMutation.mutate(data, {
      onSuccess: () => handleOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Assign Subject</DialogTitle>
          <DialogDescription>
            Assign a subject to a teacher and class arm.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setDuplicateError(null);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classArmId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Arm</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setDuplicateError(null);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class arm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classArms.map((arm) => (
                        <SelectItem key={arm.id} value={arm.id}>
                          {arm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {duplicateError && (
              <p className="text-sm text-destructive">{duplicateError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
