"use client";

import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import type { FeeStructure } from "@/types";
import type { FeeStructurePayload } from "../_service/useFeeStructureService";
import type { UseMutationResult } from "@tanstack/react-query";

const feeStructureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  applicableClasses: z.string(),
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  isActive: z.boolean(),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

interface FeeStructureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FeeStructure | null;
  createMutation: UseMutationResult<unknown, unknown, FeeStructurePayload>;
  updateMutation: UseMutationResult<unknown, unknown, FeeStructurePayload & { id: string }>;
}

export function FeeStructureDialog({
  open,
  onOpenChange,
  initialData,
  createMutation,
  updateMutation,
}: FeeStructureDialogProps) {
  const isEdit = !!initialData;

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      name: "",
      description: "",
      applicableClasses: "",
      amount: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description ?? "",
          applicableClasses: initialData.applicableClasses.join(", "),
          amount: initialData.amount,
          isActive: initialData.isActive,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          applicableClasses: "",
          amount: 0,
          isActive: true,
        });
      }
    }
  }, [open, initialData, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: FeeStructureFormData) => {
    const payload: FeeStructurePayload = {
      name: data.name,
      description: data.description || undefined,
      applicableClasses: data.applicableClasses
        ? data.applicableClasses.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      amount: data.amount,
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
              name="applicableClasses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicable Classes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. JSS1, JSS2 (comma-separated, leave empty for all)"
                      {...field}
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
