"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  FileText,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Trash2,
  Eye,
  CreditCard,
  Printer,
  Send,
  Mail,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/format";
import useInvoicesService from "./_service/useInvoicesService";
import { RecordPaymentDialog } from "./_components/RecordPaymentDialog";
import { InvoiceDetailDialog } from "./_components/InvoiceDetailDialog";
import type { Invoice } from "@/types";

function getStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
          Paid
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
          Partial
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          Overdue
        </Badge>
      );
    case "UNPAID":
      return (
        <Badge className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-700">
          Unpaid
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function InvoicesPage() {
  const router = useRouter();
  const {
    invoices,
    isLoading,
    isStatsLoading,
    filters,
    setFilters,
    deleteMutation,
    recordPaymentMutation,
    sendInvoiceMutation,
    stats,
  } = useInvoicesService();

  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Billing"
        description="Manage student invoices and track payments"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Invoices" },
        ]}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Invoices
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push("/finance/invoices/create")}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Generate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push("/finance/invoices/create?sendEmail=true")
                }
              >
                <Mail className="mr-2 h-4 w-4" />
                Generate and Send
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <InvoiceDetailDialog
        invoice={viewInvoice}
        open={!!viewInvoice}
        onOpenChange={(open) => {
          if (!open) setViewInvoice(null);
        }}
      />

      <RecordPaymentDialog
        invoice={paymentInvoice}
        open={!!paymentInvoice}
        onOpenChange={(open) => {
          if (!open) setPaymentInvoice(null);
        }}
        paymentMutation={recordPaymentMutation}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteInvoiceId}
        onOpenChange={(open) => !open && setDeleteInvoiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be
              undone. Invoices with recorded payments cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteInvoiceId) {
                  deleteMutation.mutate(deleteInvoiceId);
                  setDeleteInvoiceId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Billed</p>
                {isStatsLoading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight truncate">
                    {formatCurrency(stats.totalBilled)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                {isStatsLoading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 truncate">
                    {formatCurrency(stats.totalOutstanding)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Collected</p>
                {isStatsLoading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400 truncate">
                    {formatCurrency(stats.totalCollected)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                {isStatsLoading ? (
                  <Skeleton className="h-7 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">
                    {stats.totalInvoices}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                A list of all generated invoices for this session.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  className="w-[200px] pl-9"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                />
              </div>
              <Select
                value={filters.status || "all"}
                onValueChange={(val) =>
                  setFilters((f) => ({
                    ...f,
                    status: val === "all" ? "" : val,
                  }))
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No invoices found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate invoices to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <button
                          className="flex items-center gap-2 hover:underline text-left"
                          onClick={() => setViewInvoice(invoice)}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {invoice.invoiceNumber}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {(invoice.studentName || "??")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {invoice.studentName || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400 tabular-nums">
                        {formatCurrency(invoice.amountPaid)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {invoice.balance > 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(invoice.balance)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewInvoice(invoice)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setViewInvoice(invoice)}
                            >
                              <Printer className="mr-2 h-4 w-4" />
                              Print Invoice
                            </DropdownMenuItem>
                            {invoice.status !== "PAID" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setPaymentInvoice(invoice)}
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Record Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    sendInvoiceMutation.mutate(invoice.id)
                                  }
                                  disabled={sendInvoiceMutation.isPending}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Invoice
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => setDeleteInvoiceId(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
