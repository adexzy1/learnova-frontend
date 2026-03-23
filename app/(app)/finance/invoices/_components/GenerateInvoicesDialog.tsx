"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import apiClient from "@/lib/api-client";
import {
  CLASS_ENDPOINTS,
  SESSION_ENDPOINTS,
  TERM_ENDPOINTS,
  STUDENT_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { ClassLevel, PaginatedResponse } from "@/types";
import type { GenerateInvoicesPayload } from "../_service/useInvoicesService";
import type { UseMutationResult } from "@tanstack/react-query";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

const generateSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  sessionId: z.string().min(1, "Session is required"),
  termId: z.string().min(1, "Term is required"),
  dueDate: z.string().optional(),
  studentId: z.string().optional(),
});

type GenerateFormData = z.infer<typeof generateSchema>;

interface GenerateInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generateMutation: UseMutationResult<
    unknown,
    unknown,
    GenerateInvoicesPayload
  >;
}

export function GenerateInvoicesDialog({
  open,
  onOpenChange,
  generateMutation,
}: GenerateInvoicesDialogProps) {
  const [isSingleStudent, setIsSingleStudent] = useState(false);

  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      classId: "",
      sessionId: "",
      termId: "",
      dueDate: "",
      studentId: undefined,
    },
  });

  const selectedSessionId = form.watch("sessionId");
  const selectedClassId = form.watch("classId");

  const { data: classesResponse } = useQuery<
    AxiosResponse<{ data: Pick<ClassLevel, "id" | "name">[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_CLASSES],
    queryFn: () => apiClient.get(CLASS_ENDPOINTS.GET_SELECTABLE_CLASSES),
    enabled: open,
  });

  const { data: sessionsResponse } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_SESSION],
    queryFn: () => apiClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
    enabled: open,
  });

  const { data: termsResponse } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_TERM, selectedSessionId],
    queryFn: () =>
      apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS, {
        params: { sessionId: selectedSessionId },
      }),
    enabled: open && !!selectedSessionId,
  });

  const { data: studentsResponse } = useQuery<
    AxiosResponse<PaginatedResponse<Student>>
  >({
    queryKey: [queryKeys.STUDENTS, "by-class", selectedClassId],
    queryFn: () =>
      apiClient.get(STUDENT_ENDPOINTS.GET_ALL_STUDENTS, {
        params: { classId: selectedClassId, limit: 200 },
      }),
    enabled: open && isSingleStudent && !!selectedClassId,
  });

  const classOptions = classesResponse?.data.data ?? [];
  const sessionOptions = sessionsResponse?.data.data ?? [];
  const termOptions = termsResponse?.data.data ?? [];
  const students = studentsResponse?.data?.data?.data ?? [];

  useEffect(() => {
    if (open) {
      setIsSingleStudent(false);
      form.reset({
        classId: "",
        sessionId: "",
        termId: "",
        dueDate: "",
        studentId: undefined,
      });
    }
  }, [open, form]);

  const handleSingleStudentToggle = (checked: boolean) => {
    setIsSingleStudent(checked);
    if (!checked) {
      form.setValue("studentId", undefined);
    }
  };

  const onSubmit = (data: GenerateFormData) => {
    const payload: GenerateInvoicesPayload = {
      classId: data.classId,
      termId: data.termId,
      sessionId: data.sessionId,
      dueDate: data.dueDate || undefined,
      studentId: isSingleStudent ? data.studentId : undefined,
    };

    generateMutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Generate Invoices</DialogTitle>
          <DialogDescription>
            Generate invoices for all students in a class based on the
            applicable fee structures. Students who already have invoices for
            the selected term will be skipped.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("studentId", undefined);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classOptions.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="sessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("termId", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sessionOptions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name}
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
                name="termId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedSessionId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {termOptions.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Single Student</p>
                <p className="text-sm text-muted-foreground">
                  Generate for one student instead of the entire class
                </p>
              </div>
              <Switch
                checked={isSingleStudent}
                onCheckedChange={handleSingleStudentToggle}
                disabled={!selectedClassId}
              />
            </div>

            {isSingleStudent && selectedClassId && (
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} ({student.admissionNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending
                  ? "Generating..."
                  : "Generate Invoices"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
