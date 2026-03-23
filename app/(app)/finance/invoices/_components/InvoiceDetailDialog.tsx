"use client";

import { useRef } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";

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
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice?.invoiceNumber ?? ""}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { font-weight: 600; font-size: 13px; color: #6b7280; text-transform: uppercase; }
            td { font-size: 14px; }
            .text-right { text-align: right; }
            .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
            .summary-row.total { font-weight: 700; font-size: 16px; border-top: 2px solid #111; padding-top: 8px; margin-top: 8px; }
            .header { margin-bottom: 24px; }
            .header h1 { font-size: 20px; margin: 0 0 4px; }
            .header p { margin: 2px 0; font-size: 13px; color: #6b7280; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
            .badge-paid { background: #dcfce7; color: #15803d; }
            .badge-unpaid { background: #f1f5f9; color: #475569; }
            .badge-partial { background: #fef3c7; color: #b45309; }
            .badge-overdue { background: #fee2e2; color: #b91c1c; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
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
            {/* Visible modal content */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {invoice.studentName || "Unknown Student"}
                    {invoice.admissionNumber && (
                      <span className="ml-1">({invoice.admissionNumber})</span>
                    )}
                  </p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <Separator />

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
                      <TableCell className="text-sm">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatCurrency(Number(item.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-1.5 text-sm">
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

              <Separator />

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

            {/* Hidden printable content */}
            <div ref={printRef} className="hidden">
              <div className="header">
                <h1>Invoice {invoice.invoiceNumber}</h1>
                <p>Student: {invoice.studentName || "Unknown"}{invoice.admissionNumber ? ` (${invoice.admissionNumber})` : ""}</p>
                <p>
                  Status: <span className={`badge badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
                </p>
                <p>Issue Date: {invoice.createdAt ? format(new Date(invoice.createdAt), "MMM d, yyyy") : "—"}</p>
                <p>Due Date: {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "—"}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td className="text-right">{formatCurrency(Number(item.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="summary-row">
                <span>Total Amount</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Amount Paid</span>
                <span>{formatCurrency(invoice.amountPaid)}</span>
              </div>
              {invoice.balance > 0 && (
                <div className="summary-row total">
                  <span>Balance Due</span>
                  <span>{formatCurrency(invoice.balance)}</span>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
