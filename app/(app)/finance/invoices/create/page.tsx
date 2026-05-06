"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { ArrowLeft, ChevronDown, Mail, Receipt } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

import apiClient from "@/lib/api-client";
import {
  CLASS_ENDPOINTS,
  SESSION_ENDPOINTS,
  TERM_ENDPOINTS,
  STUDENT_ENDPOINTS,
  FINANCE_ENDPOINTS,
} from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { formatCurrency } from "@/lib/format";
import type { ClassLevel, FeeStructure, PaginatedResponse, ApiError } from "@/types";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface GenerateResult {
  generated: number;
  skipped: number;
  totalStudents: number;
}

const schema = z.object({
  classId: z.string().min(1, "Class is required"),
  sessionId: z.string().min(1, "Session is required"),
  termId: z.string().min(1, "Term is required"),
  feeItemIds: z.array(z.string()).min(1, "Select at least one fee item"),
  dueDate: z.string().optional(),
  studentId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isSingleStudent, setIsSingleStudent] = useState(false);
  const sendEmailRef = useRef(searchParams.get("sendEmail") === "true");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      classId: "",
      sessionId: "",
      termId: "",
      feeItemIds: [],
      dueDate: "",
      studentId: undefined,
    },
  });

  const selectedClassId = form.watch("classId");
  const selectedSessionId = form.watch("sessionId");
  const selectedFeeItemIds = form.watch("feeItemIds");

  const { data: classesRes } = useQuery<AxiosResponse<{ data: Pick<ClassLevel, "id" | "name">[] }>>({
    queryKey: [queryKeys.SELECTABLE_CLASSES],
    queryFn: () => apiClient.get(CLASS_ENDPOINTS.GET_SELECTABLE_CLASSES),
  });

  const { data: sessionsRes } = useQuery<AxiosResponse<{ data: { id: string; name: string }[] }>>({
    queryKey: [queryKeys.SELECTABLE_SESSION],
    queryFn: () => apiClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  });

  const { data: termsRes } = useQuery<AxiosResponse<{ data: { id: string; name: string }[] }>>({
    queryKey: [queryKeys.SELECTABLE_TERM, selectedSessionId],
    queryFn: () =>
      apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS, {
        params: { sessionId: selectedSessionId },
      }),
    enabled: !!selectedSessionId,
  });

  const { data: feeItemsRes, isLoading: isFeeItemsLoading } = useQuery<
    AxiosResponse<{ data: FeeStructure[] }>
  >({
    queryKey: [queryKeys.FEE_STRUCTURES],
    queryFn: () => apiClient.get(FINANCE_ENDPOINTS.FEE_STRUCTURES_GET_ALL),
  });

  const { data: studentsRes } = useQuery<AxiosResponse<PaginatedResponse<Student>>>({
    queryKey: [queryKeys.STUDENTS, "by-class", selectedClassId],
    queryFn: () =>
      apiClient.get(STUDENT_ENDPOINTS.GET_ALL_STUDENTS, {
        params: { classId: selectedClassId, limit: 200 },
      }),
    enabled: isSingleStudent && !!selectedClassId,
  });

  const classes = classesRes?.data.data ?? [];
  const sessions = sessionsRes?.data.data ?? [];
  const terms = termsRes?.data.data ?? [];
  const feeItems = (feeItemsRes?.data.data ?? []).filter((f) => f.isActive);
  const students = studentsRes?.data?.data?.data ?? [];

  const generateMutation = useMutation<
    AxiosResponse<{ data: GenerateResult }>,
    ApiError,
    FormData
  >({
    mutationFn: (data) =>
      apiClient.post(FINANCE_ENDPOINTS.INVOICES_GENERATE, {
        classId: data.classId,
        termId: data.termId,
        sessionId: data.sessionId,
        feeItemIds: data.feeItemIds,
        dueDate: data.dueDate || undefined,
        studentId: isSingleStudent ? data.studentId : undefined,
        sendEmail: sendEmailRef.current,
      }),
    onSuccess: (res) => {
      const { generated, skipped } = res.data.data;
      queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
      let message = `${generated} invoice${generated !== 1 ? "s" : ""} generated`;
      if (sendEmailRef.current) message += " and emails sent to guardians";
      if (skipped > 0) message += ` · ${skipped} skipped (already invoiced)`;
      toast.success(message);
      router.push("/finance/invoices");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to generate invoices");
    },
  });

  const handleSubmit = (withEmail: boolean) => {
    sendEmailRef.current = withEmail;
    form.handleSubmit((data) => generateMutation.mutate(data))();
  };

  const selectedFeeItems = feeItems.filter((f) => selectedFeeItemIds.includes(f.id));
  const selectedTotal = selectedFeeItems.reduce((sum, f) => sum + Number(f.amount), 0);

  const toggleFeeItem = (id: string) => {
    const current = form.getValues("feeItemIds");
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    form.setValue("feeItemIds", next, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Invoices"
        description="Select a class, term and fee items to generate invoices for students"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Invoices", href: "/finance/invoices" },
          { label: "Generate" },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.push("/finance/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form className="grid gap-6 lg:grid-cols-3">
          {/* Left — configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class & term */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Target</CardTitle>
                <CardDescription>Which class and term are these invoices for?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("studentId", undefined);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sessionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.setValue("termId", "");
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sessions.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                            {terms.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
                      <FormLabel>Due Date <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Fee items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fee Items</CardTitle>
                <CardDescription>Select the charges to include on each invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="feeItemIds"
                  render={() => (
                    <FormItem>
                      {isFeeItemsLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : feeItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No active fee items found. Add some in Fee Items first.
                        </p>
                      ) : (
                        <div className="divide-y rounded-md border">
                          {feeItems.map((item) => {
                            const checked = selectedFeeItemIds.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => toggleFeeItem(item.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                  )}
                                </div>
                                {item.category && (
                                  <Badge variant="outline" className="text-xs shrink-0">{item.category}</Badge>
                                )}
                                <span className="text-sm font-semibold tabular-nums shrink-0">
                                  {formatCurrency(Number(item.amount))}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Single student toggle */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Single Student</p>
                    <p className="text-sm text-muted-foreground">
                      Generate for one student instead of the entire class
                    </p>
                  </div>
                  <Switch
                    checked={isSingleStudent}
                    onCheckedChange={(v) => {
                      setIsSingleStudent(v);
                      if (!v) form.setValue("studentId", undefined);
                    }}
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
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.firstName} {s.lastName} ({s.admissionNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right — summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedFeeItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No fee items selected yet
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {selectedFeeItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="tabular-nums font-medium">
                            {formatCurrency(Number(item.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total per student</span>
                      <span className="tabular-nums">{formatCurrency(selectedTotal)}</span>
                    </div>
                  </>
                )}

                <div className="flex w-full">
                  <Button
                    type="button"
                    className="flex-1 rounded-r-none"
                    disabled={generateMutation.isPending || selectedFeeItemIds.length === 0}
                    onClick={() => handleSubmit(false)}
                  >
                    {generateMutation.isPending ? "Generating..." : "Generate Invoices"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        className="rounded-l-none border-l border-l-primary-foreground/20 px-2"
                        disabled={generateMutation.isPending || selectedFeeItemIds.length === 0}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => handleSubmit(false)}>
                        <Receipt className="mr-2 h-4 w-4" />
                        Generate Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSubmit(true)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Generate and Send Emails
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Students already invoiced for this term will be skipped automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
