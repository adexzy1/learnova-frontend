"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";

// Mock Data
const MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    date: "2024-10-01",
    description: "School Fees - John Doe",
    amount: 150000,
    type: "credit",
    category: "Tuition",
    ref: "PAY-001",
  },
  {
    id: "tx-2",
    date: "2024-10-02",
    description: "Office Supplies",
    amount: 25000,
    type: "debit",
    category: "Admin",
    ref: "EXP-045",
  },
  {
    id: "tx-3",
    date: "2024-10-02",
    description: "Uniform Purchase - Mary Smith",
    amount: 15000,
    type: "credit",
    category: "Inventory",
    ref: "PAY-002",
  },
  {
    id: "tx-4",
    date: "2024-10-03",
    description: "Fuel Allowance",
    amount: 10000,
    type: "debit",
    category: "Transport",
    ref: "EXP-046",
  },
  {
    id: "tx-5",
    date: "2024-10-03",
    description: "Exam Fee - Class JSS1",
    amount: 45000,
    type: "credit",
    category: "Exam",
    ref: "PAY-003",
  },
];

export default function LedgerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger"
        description="Track all financial inflows and outflows"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Ledger" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              This Month
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>Export Report</Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              ₦12,500,000
            </div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
              <ArrowUpRight className="h-3 w-3 inline mr-1" />
              +15% vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              ₦4,200,000
            </div>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
              <ArrowDownLeft className="h-3 w-3 inline mr-1" />
              -5% vs last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Net Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              ₦8,300,000
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
              Healthy
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Recent financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TRANSACTIONS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(tx.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{tx.ref}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {tx.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.type === "credit" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                        Income
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                        Expense
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
