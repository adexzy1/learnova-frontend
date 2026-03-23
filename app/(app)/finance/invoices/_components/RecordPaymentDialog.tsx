"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, CreditCard, Building2, Globe } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/types";
import type { UseMutationResult } from "@tanstack/react-query";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "TRANSFER", label: "Bank Transfer", icon: Building2 },
  { value: "CARD", label: "Card", icon: CreditCard },
  { value: "ONLINE", label: "Online", icon: Globe },
] as const;

const paymentSchema = z.object({
  paymentType: z.enum(["full", "partial"]),
  amount: z.coerce
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "ONLINE"], {
    required_error: "Select a payment method",
  }),
  reference: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface CreatePaymentPayload {
  studentId: string;
  amount: number;
  paymentMethod: "CASH" | "TRANSFER" | "CARD" | "ONLINE";
  reference?: string;
  allocations: { invoiceId: string; amount: number }[];
}

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMutation: UseMutationResult<unknown, unknown, CreatePaymentPayload>;
}

export function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
  paymentMutation,
}: RecordPaymentDialogProps) {
  const balance = invoice ? invoice.balance : 0;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: "full",
      amount: balance,
      paymentMethod: "CASH",
      reference: "",
    },
  });

  const paymentType = form.watch("paymentType");

  useEffect(() => {
    if (open && invoice) {
      const bal = Number(invoice.totalAmount) - Number(invoice.amountPaid);
      form.reset({
        paymentType: "full",
        amount: bal,
        paymentMethod: "CASH",
        reference: "",
      });
    }
  }, [open, invoice, form]);

  useEffect(() => {
    if (paymentType === "full" && invoice) {
      const bal = Number(invoice.totalAmount) - Number(invoice.amountPaid);
      form.setValue("amount", bal);
    }
  }, [paymentType, invoice, form]);

  const onSubmit = (data: PaymentFormData) => {
    if (!invoice) return;

    const payload: CreatePaymentPayload = {
      studentId: invoice.studentId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      reference: data.reference || undefined,
      allocations: [{ invoiceId: invoice.id, amount: data.amount }],
    };

    paymentMutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Invoice {invoice.invoiceNumber} — Balance:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(balance)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full / Partial toggle */}
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="payment-full"
                        className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                          field.value === "full"
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value="full" id="payment-full" />
                        <div>
                          <p className="text-sm font-medium">Full Payment</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(balance)}
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="payment-partial"
                        className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                          field.value === "partial"
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value="partial" id="payment-partial" />
                        <div>
                          <p className="text-sm font-medium">Partial</p>
                          <p className="text-xs text-muted-foreground">
                            Custom amount
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount field (editable only for partial) */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balance}
                      disabled={paymentType === "full"}
                      {...field}
                    />
                  </FormControl>
                  {paymentType === "partial" && (
                    <p className="text-xs text-muted-foreground">
                      Max: {formatCurrency(balance)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <span className="flex items-center gap-2">
                            <method.icon className="h-4 w-4" />
                            {method.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference */}
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. receipt number, transfer ref"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
              <Button type="submit" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending
                  ? "Recording..."
                  : `Record ${formatCurrency(form.watch("amount"))}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
