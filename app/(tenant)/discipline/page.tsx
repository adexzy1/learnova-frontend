"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, AlertTriangle, ShieldAlert, Gavel } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/shared/page-header";
import { fetchDisciplineIncidents } from "@/lib/api";

export default function DisciplinePage() {
  const { data: incidents, isLoading } = useQuery({
    queryKey: ["discipline"],
    queryFn: () => fetchDisciplineIncidents(),
  });

  // Mock colors for severity
  const getSeverityColor = (type: string) => {
    switch (type) {
      case "minor":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "major":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      case "severe":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discipline & Behavior"
        description="Track and manage student disciplinary records"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Discipline" },
        ]}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Incident</DialogTitle>
                <DialogDescription>
                  Record a new disciplinary incident.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Input placeholder="Search student name..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the incident..." />
                </div>
                <Button className="w-full">Submit Report</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sanctions
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Students currently on probation/suspension
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Incidents
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Recorded in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolution Rate
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Incidents resolved within 48h
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Incident Log</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents?.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    {format(new Date(incident.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {incident.studentName}
                  </TableCell>
                  <TableCell
                    className="max-w-[300px] truncate"
                    title={incident.description}
                  >
                    {incident.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-0 ${getSeverityColor(incident.type)}`}
                    >
                      {incident.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    Staff Member
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        incident.status === "resolved" ? "secondary" : "default"
                      }
                    >
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
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
