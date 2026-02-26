"use client";

import { format } from "date-fns";
import { Download, Receipt, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { BillingRecord } from "@/types";

interface BillingHistoryProps {
  records: BillingRecord[];
  isLoading: boolean;
}

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  pending:
    "bg-amber-500/15 text-amber-700 border-amber-500/20 dark:text-amber-400",
  failed: "bg-red-500/15 text-red-700 border-red-500/20 dark:text-red-400",
  refunded:
    "bg-gray-500/15 text-gray-700 border-gray-500/20 dark:text-gray-400",
};

export function BillingHistory({ records, isLoading }: BillingHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Billing History
            </CardTitle>
            <CardDescription>
              Your past payments and transaction records
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No billing records yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your payment history will appear here after your first payment.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(record.paidAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.description}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        ₦{record.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.paymentMethod}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[record.status] ?? ""}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Download receipt"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card layout */}
            <div className="space-y-3 md:hidden">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {record.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.paidAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusStyles[record.status] ?? ""}
                    >
                      {record.status.charAt(0).toUpperCase() +
                        record.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">
                        ₦{record.amount.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {record.paymentMethod}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8">
                      <Download className="h-3 w-3" />
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
