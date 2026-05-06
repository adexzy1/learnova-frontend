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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import apiClient from "@/lib/api-client";
import { SESSION_ENDPOINTS, TERM_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { FeeStructure } from "@/types";
import type { FeeStructurePayload } from "../_service/useFeeStructureService";
import type { UseMutationResult } from "@tanstack/react-query";

const FEE_CATEGORIES = [
  "Tuition",
  "PTA Levy",
  "Lab Fee",
  "Sports Fee",
  "Exam Fee",
  "Library Fee",
  "Development Levy",
  "Uniform",
  "Books",
  "Transport",
  "Other",
];

const feeStructureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  termId: z.string().optional(),
  isActive: z.boolean(),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

interface FeeStructureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FeeStructure | null;
  createMutation: UseMutationResult<unknown, unknown, FeeStructurePayload>;
  updateMutation: UseMutationResult<
    unknown,
    unknown,
    FeeStructurePayload & { id: string }
  >;
}

export function FeeStructureDialog({
  open,
  onOpenChange,
  initialData,
  createMutation,
  updateMutation,
}: FeeStructureDialogProps) {
  const isEdit = !!initialData;
  const [isTermSpecific, setIsTermSpecific] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const { data: sessionsResponse } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_SESSION],
    queryFn: () => apiClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
    enabled: open && isTermSpecific,
  });

  const { data: termsResponse } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_TERM, selectedSessionId],
    queryFn: () =>
      apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS, {
        params: { sessionId: selectedSessionId },
      }),
    enabled: open && isTermSpecific && !!selectedSessionId,
  });

  const sessionOptions = sessionsResponse?.data.data ?? [];
  const termOptions = termsResponse?.data.data ?? [];

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      amount: 0,
      termId: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const hasTermId = !!initialData.termId;
        setIsTermSpecific(hasTermId);
        setSelectedSessionId("");
        form.reset({
          name: initialData.name,
          description: initialData.description ?? "",
          category: initialData.category ?? "",
          amount: initialData.amount,
          termId: initialData.termId ?? undefined,
          isActive: initialData.isActive,
        });
      } else {
        setIsTermSpecific(false);
        setSelectedSessionId("");
        form.reset({
          name: "",
          description: "",
          category: "",
          amount: 0,
          termId: undefined,
          isActive: true,
        });
      }
    }
  }, [open, initialData, form]);

  const handleTermSpecificToggle = (checked: boolean) => {
    setIsTermSpecific(checked);
    if (!checked) {
      setSelectedSessionId("");
      form.setValue("termId", undefined);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FeeStructureFormData) => {
    const payload: FeeStructurePayload = {
      name: data.name,
      description: data.description || undefined,
      category: data.category || undefined,
      amount: data.amount,
      termId: isTermSpecific ? data.termId : undefined,
      isActive: data.isActive,
    };

    if (isEdit && initialData) {
      updateMutation.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Fee Item" : "Add Fee Item"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this fee item. It will be available to select when generating invoices."
              : "Create a fee item that can be added to any invoice."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tuition Fee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FEE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Term Specific</p>
                <p className="text-sm text-muted-foreground">
                  Only show this item for a specific term
                </p>
              </div>
              <Switch
                checked={isTermSpecific}
                onCheckedChange={handleTermSpecificToggle}
              />
            </div>

            {isTermSpecific && (
              <div className="grid grid-cols-2 gap-3">
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <Select
                    value={selectedSessionId}
                    onValueChange={(v) => {
                      setSelectedSessionId(v);
                      form.setValue("termId", undefined);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessionOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormField
                  control={form.control}
                  name="termId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term</FormLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={!selectedSessionId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {termOptions.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Available for selection when generating invoices
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
