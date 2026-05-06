"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, TrendingDown, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/format";

import useExpensesService from "./_service/useExpensesService";
import type { CreateExpensePayload } from "./_service/useExpensesService";

const EXPENSE_CATEGORIES = [
  "Salaries",
  "Utilities",
  "Maintenance",
  "Supplies",
  "Equipment",
  "Events",
  "Transport",
  "Rent",
  "Marketing",
  "Other",
];

const schema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().optional(),
  reference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { expenses, isLoading, createMutation } = useExpensesService();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { description: "", amount: 0, category: "", reference: "" },
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const onSubmit = (data: FormData) => {
    const payload: CreateExpensePayload = {
      entryType: "EXPENSE",
      description: data.description,
      amount: data.amount,
      category: data.category || undefined,
      reference: data.reference || undefined,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
        form.reset();
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track school expenditures and operational costs"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Expenses" },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Expense
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpenses)}
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
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">{expenses.length}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Log</CardTitle>
          <CardDescription>A record of all logged school expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <TrendingDown className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No expenses logged yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Log your first expense to start tracking school costs
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {expense.occurredAt
                          ? format(new Date(expense.occurredAt), "MMM d, yyyy")
                          : format(new Date(expense.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[240px] truncate">
                        {expense.description}
                      </TableCell>
                      <TableCell>
                        {expense.category && expense.category !== "GENERAL" ? (
                          <Badge variant="outline" className="text-xs font-normal">
                            {expense.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {expense.reference || "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-red-600 dark:text-red-400">
                        {formatCurrency(Number(expense.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Expense Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Log Expense</DialogTitle>
            <DialogDescription>
              Record a school expense for your financial records.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Generator fuel purchase"
                        rows={2}
                        {...field}
                      />
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
                        <Input type="number" min={0} step="0.01" placeholder="0.00" {...field} />
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
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Receipt no., invoice no., etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Log Expense"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
