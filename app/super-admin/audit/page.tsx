"use client";

import { useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  Download,
  Shield,
  User,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Mock Data
const AUDIT_LOGS = [
  {
    id: "log-1",
    action: "User Login",
    user: "admin@school1.com",
    role: "School Admin",
    ip: "192.168.1.1",
    timestamp: "2024-10-25T08:30:00",
    status: "success",
    details: "Successful login",
  },
  {
    id: "log-2",
    action: "Update Settings",
    user: "admin@school1.com",
    role: "School Admin",
    ip: "192.168.1.1",
    timestamp: "2024-10-25T09:15:00",
    status: "success",
    details: "Updated grading system",
  },
  {
    id: "log-3",
    action: "Delete Student",
    user: "principal@school1.com",
    role: "Super Admin",
    ip: "10.0.0.5",
    timestamp: "2024-10-25T10:00:00",
    status: "warning",
    details: "Deleted student ADM/2023/001",
  },
  {
    id: "log-4",
    action: "Failed Login",
    user: "unknown@user.com",
    role: "Guest",
    ip: "45.2.1.9",
    timestamp: "2024-10-25T11:45:00",
    status: "error",
    details: "Invalid password attempt",
  },
  {
    id: "log-5",
    action: "View Report",
    user: "teacher@school1.com",
    role: "Teacher",
    ip: "192.168.1.20",
    timestamp: "2024-10-25T13:20:00",
    status: "success",
    details: "Accessed term reports",
  },
];

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Monitor system activity and security events"
        breadcrumbs={[
          { label: "Dashboard", href: "/super-admin" },
          { label: "Audit Logs" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border">
        <div className="flex gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="data">Data Changes</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AUDIT_LOGS.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>
                        {format(new Date(log.timestamp), "MMM d, yyyy")}
                      </span>
                      <span>{format(new Date(log.timestamp), "HH:mm:ss")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{log.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {log.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ip}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === "success"
                          ? "secondary"
                          : log.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        log.status === "success"
                          ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                          : log.status === "warning"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : ""
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground text-xs max-w-[200px] truncate"
                    title={log.details}
                  >
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing 1-5 of 1,248 logs
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
