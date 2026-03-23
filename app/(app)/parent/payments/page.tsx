"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { FINANCE_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { useChildSelector } from "../ChildSelectorContext";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import type { Invoice, PaginatedResponse, PaystackInitResponse } from "@/types";

// ─── Status badge config ──────────────────────────────────────────────────────

const statusConfig: Record<
  Invoice["status"],
  { label: string; className: string }
> = {
  paid: { label: "Paid", className: "bg-green-100 text-green-700 border-green-300" },
  partial: { label: "Partial", className: "bg-amber-100 text-amber-700 border-amber-300" },
  unpaid: { label: "Unpaid", className: "bg-red-100 text-red-700 border-red-300" },
  overdue: { label: "Overdue", className: "bg-rose-100 text-rose-800 border-rose-300" },
};

const PAYABLE_STATUSES: Invoice["status"][] = ["unpaid", "partial", "overdue"];

// ─── Paystack hook ────────────────────────────────────────────────────────────

function usePaystackPayment() {
  const queryClient = useQueryClient();
  const [payingId, setPayingId] = useState<string | null>(null);

  async function pay(invoice: Invoice) {
    if (payingId) return;
    setPayingId(invoice.id);

    try {
      const url = FINANCE_ENDPOINTS.INIT_PAYMENT.replace(":id", invoice.id);
      const res = await apiClient.post<PaystackInitResponse>(url);
      const { authorizationUrl, accessCode } = res.data;

      const onClose = () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
        setPayingId(null);
      };

      // Try @paystack/inline-js first, fall back to window.open
      try {
        const PaystackPop = (await import("@paystack/inline-js")).default;
        const handler = new PaystackPop();
        handler.resumeTransaction(accessCode, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.INVOICES] });
            setPayingId(null);
          },
          onCancel: onClose,
        });
      } catch {
        // Fallback: open authorization URL in new tab
        window.open(authorizationUrl, "_blank");
        onClose();
      }
    } catch {
      toast.error("Failed to initialize payment. Please try again.");
      setPayingId(null);
    }
  }

  return { pay, payingId };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PaymentsSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentPaymentsPage() {
  const { selectedChildId } = useChildSelector();
  const { pay, payingId } = usePaystackPayment();

  const { data: invoicesResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Invoice>>
  >({
    queryKey: [queryKeys.INVOICES, selectedChildId],
    queryFn: () =>
      apiClient.get(FINANCE_ENDPOINTS.INVOICES_GET_ALL, {
        params: { studentId: selectedChildId },
      }),
    enabled: !!selectedChildId,
  });

  const invoices = invoicesResponse?.data?.data ?? [];

  if (!selectedChildId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payments" />
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Please select a child to view their payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" />

      {isLoading ? (
        <PaymentsSkeleton />
      ) : invoices.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No invoices found.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const config = statusConfig[invoice.status] ?? statusConfig.unpaid;
                  const isPayable = PAYABLE_STATUSES.includes(invoice.status);
                  const isThisPaying = payingId === invoice.id;
                  const feeType =
                    invoice.items.length > 0
                      ? invoice.items.map((i) => i.description).join(", ")
                      : invoice.invoiceNumber;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.studentName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {feeType}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(invoice.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right text-red-500 font-medium">
                        {invoice.balance > 0 ? formatCurrency(invoice.balance) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={config.className}
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isPayable && (
                          <Button
                            size="sm"
                            disabled={!!payingId}
                            onClick={() => pay(invoice)}
                          >
                            {isThisPaying ? "Processing…" : "Pay Now"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
