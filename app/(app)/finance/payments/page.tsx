"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Plus,
  Download,
  Eye,
  CreditCard,
  Banknote,
  Receipt,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
} from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { mockApi } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const paymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeTypeId: z.string().min(1, "Fee type is required"),
  amount: z.number().min(1, "Amount is required"),
  paymentMethod: z.enum(["cash", "bank_transfer", "card", "online"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  feeType: string;
  amount: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  reference: string;
  status: "paid" | "partial" | "pending" | "overdue";
  paymentDate: string;
}

export default function PaymentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { data: students } = useSWR("students", mockApi.getStudents);
  const { data: feeTypes } = useSWR("feeTypes", mockApi.getFeeTypes);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  // Mock payments data
  const payments: Payment[] = [
    {
      id: "pay-1",
      studentId: "std-1",
      studentName: "John Adewale",
      admissionNumber: "ADM/2024/001",
      className: "JSS 1A",
      feeType: "School Fees",
      amount: 150000,
      amountPaid: 150000,
      balance: 0,
      paymentMethod: "bank_transfer",
      reference: "PAY-2024-001",
      status: "paid",
      paymentDate: "2024-01-15",
    },
    {
      id: "pay-2",
      studentId: "std-2",
      studentName: "Amina Mohammed",
      admissionNumber: "ADM/2024/002",
      className: "JSS 1A",
      feeType: "School Fees",
      amount: 150000,
      amountPaid: 75000,
      balance: 75000,
      paymentMethod: "card",
      reference: "PAY-2024-002",
      status: "partial",
      paymentDate: "2024-01-18",
    },
    {
      id: "pay-3",
      studentId: "std-3",
      studentName: "Chukwuemeka Obi",
      admissionNumber: "ADM/2024/003",
      className: "JSS 1B",
      feeType: "School Fees",
      amount: 150000,
      amountPaid: 0,
      balance: 150000,
      paymentMethod: "",
      reference: "",
      status: "pending",
      paymentDate: "",
    },
    {
      id: "pay-4",
      studentId: "std-4",
      studentName: "Fatima Ibrahim",
      admissionNumber: "ADM/2024/004",
      className: "JSS 2A",
      feeType: "School Fees",
      amount: 150000,
      amountPaid: 0,
      balance: 150000,
      paymentMethod: "",
      reference: "",
      status: "overdue",
      paymentDate: "",
    },
    {
      id: "pay-5",
      studentId: "std-5",
      studentName: "David Okonkwo",
      admissionNumber: "ADM/2024/005",
      className: "SS 1A",
      feeType: "Examination Fee",
      amount: 25000,
      amountPaid: 25000,
      balance: 0,
      paymentMethod: "online",
      reference: "PAY-2024-003",
      status: "paid",
      paymentDate: "2024-01-20",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.admissionNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter((p) => p.status === "paid" || p.status === "partial")
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const totalOutstanding = payments.reduce((sum, p) => sum + p.balance, 0);

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-amber-100 text-amber-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "online":
        return <CreditCard className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsDialogOpen(false);
    reset();
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Finance"
        description="Manage student payments, fees, and financial records"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a new payment for a student
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student</Label>
                  <Select onValueChange={(v) => setValue("studentId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} -{" "}
                          {student.admissionNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.studentId && (
                    <p className="text-sm text-destructive">
                      {errors.studentId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeTypeId">Fee Type</Label>
                  <Select onValueChange={(v) => setValue("feeTypeId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feeTypes?.map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.name} - {formatCurrency(fee.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feeTypeId && (
                    <p className="text-sm text-destructive">
                      {errors.feeTypeId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    {...register("amount", { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-sm text-destructive">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    onValueChange={(v) =>
                      setValue(
                        "paymentMethod",
                        v as PaymentFormData["paymentMethod"],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference (Optional)</Label>
                  <Input
                    id="reference"
                    placeholder="Transaction reference"
                    {...register("reference")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Students</p>
                <p className="text-2xl font-bold">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="fees">Fee Structure</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, admission no., or reference..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48 space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                View and manage all payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.admissionNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.className}</TableCell>
                      <TableCell>{payment.feeType}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.amountPaid)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.balance)}
                      </TableCell>
                      <TableCell>
                        {payment.paymentMethod && (
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="capitalize">
                              {payment.paymentMethod.replace("_", " ")}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(payment.status === "paid" ||
                            payment.status === "partial") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReceipt(payment)}
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fee Structure</CardTitle>
                <CardDescription>
                  Manage fee types and amounts for the current session
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Fee Type
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Applicable To</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeTypes?.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.name}</TableCell>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {fee.applicableTo === "all"
                            ? "All Classes"
                            : fee.applicableTo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(fee.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            fee.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {fee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Collection Summary</CardTitle>
                <CardDescription>
                  Payment collection overview for the current term
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Expected
                    </span>
                    <span className="font-bold">{formatCurrency(750000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Total Collected
                    </span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Outstanding</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(totalOutstanding)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Collection Rate
                    </span>
                    <span className="font-bold">
                      {((totalRevenue / 750000) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Bank Transfer
                      </span>
                    </div>
                    <span className="font-bold">{formatCurrency(150000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Card</span>
                    </div>
                    <span className="font-bold">{formatCurrency(75000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Online</span>
                    </div>
                    <span className="font-bold">{formatCurrency(25000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Cash</span>
                    </div>
                    <span className="font-bold">{formatCurrency(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>
                  Export financial reports for various purposes
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col bg-transparent"
                >
                  <Receipt className="h-6 w-6 mb-2" />
                  <span>Payment Summary</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col bg-transparent"
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span>Defaulters List</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col bg-transparent"
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Revenue Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt for {selectedPayment?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold text-lg">EXCELLENCE HIGH SCHOOL</h3>
                <p className="text-sm text-muted-foreground">
                  Official Receipt
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt No:</span>
                  <span className="font-medium">
                    {selectedPayment.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">
                    {selectedPayment.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium">
                    {selectedPayment.className}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Type:</span>
                  <span className="font-medium">{selectedPayment.feeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium capitalize">
                    {selectedPayment.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedPayment.amountPaid)}</span>
                </div>
                {selectedPayment.balance > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Balance:</span>
                    <span>{formatCurrency(selectedPayment.balance)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button className="flex-1">Print</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
