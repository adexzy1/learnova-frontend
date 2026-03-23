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
import { MultiSelect } from "@/components/shared/multi-select";

import apiClient from "@/lib/api-client";
import { CLASS_ENDPOINTS, SESSION_ENDPOINTS, TERM_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { FeeStructure, ClassLevel } from "@/types";
import type { FeeStructurePayload } from "../_service/useFeeStructureService";
import type { UseMutationResult } from "@tanstack/react-query";

const feeStructureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  applicableClassIds: z.array(z.string()),
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

  const classOptions =
    classesResponse?.data.data.map((cls) => ({
      value: cls.id,
      label: cls.name,
    })) ?? [];

  const sessionOptions = sessionsResponse?.data.data ?? [];
  const termOptions = termsResponse?.data.data ?? [];

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      name: "",
      description: "",
      applicableClassIds: [],
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
          applicableClassIds: initialData.applicableClassIds ?? [],
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
          applicableClassIds: [],
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

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    form.setValue("termId", undefined);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FeeStructureFormData) => {
    const payload: FeeStructurePayload = {
      name: data.name,
      description: data.description || undefined,
      applicableClassIds: data.applicableClassIds,
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
            {isEdit ? "Edit Fee Structure" : "Add Fee Structure"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the fee structure details below."
              : "Create a new fee structure for your school."}
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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

            <FormField
              control={form.control}
              name="applicableClassIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicable Classes</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={classOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select classes (leave empty for all)"
                      emptyMessage="No classes found."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Term Specific</p>
                <p className="text-sm text-muted-foreground">
                  Apply this fee to a specific term only
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
                    onValueChange={handleSessionChange}
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
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable this fee structure
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
