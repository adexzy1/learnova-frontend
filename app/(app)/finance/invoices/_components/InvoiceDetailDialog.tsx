"use client";

import { useRef } from "react";
import { format } from "date-fns";
import { ExternalLink, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
import type { Invoice } from "@/types";

function getStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
          Paid
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
          Partial
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          Overdue
        </Badge>
      );
    case "UNPAID":
      return (
        <Badge className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-700">
          Unpaid
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface InvoiceWithDetails extends Invoice {
  admissionNumber?: string;
}

interface InvoiceDetailDialogProps {
  invoice: InvoiceWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
  isLoading,
}: InvoiceDetailDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=820,height=700");
    if (!win) return;

    const paymentSection = invoice?.paymentLink
      ? `<div class="payment-box">
           <p class="payment-label">Pay this invoice online</p>
           <a href="${invoice.paymentLink}" class="payment-btn">Pay Now</a>
           <p class="payment-url">${invoice.paymentLink}</p>
         </div>`
      : "";

    win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Invoice ${invoice?.invoiceNumber ?? ""}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        color: #111;
        background: #fff;
        padding: 40px;
      }
      /* ── header ── */
      .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
      .inv-title { font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
      .inv-number { font-size: 13px; color: #6b7280; font-family: monospace; margin-top: 4px; }
      .school-name { font-size: 18px; font-weight: 700; }
      /* ── divider ── */
      .divider { border: none; border-top: 3px solid #2563eb; margin-bottom: 24px; }
      /* ── meta grid ── */
      .meta { display: flex; justify-content: space-between; margin-bottom: 28px; font-size: 13px; }
      .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; margin-bottom: 4px; font-weight: 600; }
      .meta-value { font-weight: 600; color: #111; }
      .meta-right { text-align: right; }
      .meta-right table { border-collapse: collapse; }
      .meta-right td { padding: 2px 0; }
      .meta-right td:first-child { color: #9ca3af; padding-right: 12px; font-size: 12px; }
      .meta-right td:last-child { font-weight: 600; font-size: 13px; text-align: right; }
      .due-red { color: #dc2626; }
      /* ── items table ── */
      table.items { width: 100%; border-collapse: collapse; margin-bottom: 0; }
      table.items th {
        padding: 9px 14px; font-size: 11px; text-transform: uppercase;
        letter-spacing: .06em; color: #6b7280; background: #f3f4f6;
        border-bottom: 2px solid #e5e7eb; font-weight: 600;
      }
      table.items th:last-child, table.items td:last-child { text-align: right; }
      table.items td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
      table.items tr:nth-child(even) td { background: #f9fafb; }
      /* ── totals ── */
      .totals { display: flex; justify-content: flex-end; margin-top: 0; }
      .totals table { border-collapse: collapse; min-width: 260px; }
      .totals td { padding: 6px 14px; font-size: 13px; }
      .totals td:last-child { text-align: right; white-space: nowrap; }
      .totals .label { color: #6b7280; }
      .totals .total-row td { border-top: 2px solid #dc2626; padding-top: 10px; font-size: 15px; font-weight: 700; }
      .totals .total-row td:last-child { color: #dc2626; }
      /* ── payment box ── */
      .payment-box {
        margin-top: 32px; border: 2px solid #2563eb; border-radius: 8px;
        padding: 20px 24px; text-align: center;
      }
      .payment-label { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
      .payment-btn {
        display: inline-block; background: #2563eb; color: #fff;
        font-size: 14px; font-weight: 700; padding: 10px 28px;
        border-radius: 6px; text-decoration: none; margin-bottom: 10px;
      }
      .payment-url { font-size: 11px; color: #6b7280; word-break: break-all; }
      /* ── footer ── */
      .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
      @media print {
        body { padding: 24px; }
        .payment-btn { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    ${printContent}
    ${paymentSection}
    <div class="footer">This is an official invoice. Please keep it for your records.</div>
  </body>
</html>`);
    win.document.close();
    win.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Details</DialogTitle>
            {invoice && (
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-60" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : invoice ? (
          <>
            {/* ── Visible modal content (also used as print source) ── */}
            <div ref={printRef}>
              {/* Header */}
              <div className="inv-header flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-muted-foreground">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-base font-semibold mt-0.5">
                    {invoice.studentName || "Unknown Student"}
                    {invoice.admissionNumber && (
                      <span className="text-muted-foreground font-normal ml-1.5 text-sm">
                        ({invoice.admissionNumber})
                      </span>
                    )}
                  </p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <Separator className="my-4" />

              {/* Items */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">{item.description}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatCurrency(Number(item.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="space-y-1.5 text-sm mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="text-green-600 dark:text-green-400 tabular-nums">
                    {formatCurrency(invoice.amountPaid)}
                  </span>
                </div>
                {invoice.balance > 0 && (
                  <div className="flex justify-between font-semibold border-t pt-1.5">
                    <span>Balance Due</span>
                    <span className="text-red-600 dark:text-red-400 tabular-nums">
                      {formatCurrency(invoice.balance)}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">
                    {invoice.createdAt
                      ? format(new Date(invoice.createdAt), "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {invoice.dueDate
                      ? format(new Date(invoice.dueDate), "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Payment link (shown in modal + included in print via JS) ── */}
            {invoice.paymentLink && invoice.status !== "PAID" && (
              <div className="mt-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Guardian can pay directly using the link below
                </p>
                <a
                  href={invoice.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
                >
                  Pay {formatCurrency(invoice.balance)} Now
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <p className="text-xs text-muted-foreground break-all">
                  {invoice.paymentLink}
                </p>
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
