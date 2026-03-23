"use client";

import React from "react";
import { format } from "date-fns";
import {
  Save,
  Calendar,
  Check,
  X,
  Clock,
  AlertCircle,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import useAttendanceService, {
  type AttendanceStatus,
} from "./_service/useAttendanceService";

const statusConfig: Record<
  AttendanceStatus,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
    badgeVariant: string;
  }
> = {
  present: {
    label: "Present",
    icon: <Check className="h-4 w-4" />,
    className:
      "bg-green-100 text-green-700 hover:bg-green-200 border-green-300",
    badgeVariant: "bg-green-100 text-green-700 border-green-300",
  },
  absent: {
    label: "Absent",
    icon: <X className="h-4 w-4" />,
    className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300",
    badgeVariant: "bg-red-100 text-red-700 border-red-300",
  },
  late: {
    label: "Late",
    icon: <Clock className="h-4 w-4" />,
    className:
      "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300",
    badgeVariant: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  excused: {
    label: "Excused",
    icon: <AlertCircle className="h-4 w-4" />,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300",
    badgeVariant: "bg-blue-100 text-blue-700 border-blue-300",
  },
};

export default function AttendancePage() {
  const {
    selectedClass,
    selectedDate,
    handleClassChange,
    handleDateChange,
    classOptions,
    classesLoading,
    students,
    studentsLoading,
    existingAttendanceLoading,
    attendance,
    hasExistingRecords,
    isEditMode,
    setIsEditMode,
    stats,
    handleStatusChange,
    markAll,
    resetAttendance,
    handleSave,
    saveMutation,
  } = useAttendanceService();

  const isLoading = studentsLoading || existingAttendanceLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark and manage daily student attendance"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Attendance" },
        ]}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Class & Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={selectedClass}
                onValueChange={handleClassChange}
                disabled={classesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAll("present")}
                  disabled={!selectedClass || !isEditMode}
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAttendance}
                  disabled={!selectedClass || !isEditMode}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {selectedClass && students.length > 0 && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Present</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {stats.present}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Absent</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {stats.absent}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Late</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">
                {stats.late}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Excused</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {stats.excused}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Attendance for{" "}
                {format(
                  new Date(selectedDate + "T00:00:00"),
                  "EEEE, MMMM d, yyyy",
                )}
              </CardTitle>
              <CardDescription>
                {hasExistingRecords && !isEditMode
                  ? "Attendance already recorded for this date. Click Edit to make changes."
                  : "Click on a status to mark attendance"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {hasExistingRecords && !isEditMode ? (
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={
                    Object.keys(attendance).length === 0 ||
                    saveMutation.isPending
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? "Saving..." : "Save Attendance"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found in this class
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S/N</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const entry = attendance[student.id];
                    const currentStatus = entry?.status ?? "present";
                    const config = statusConfig[currentStatus];

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={student.photo ?? "/placeholder.svg"}
                                alt={student.firstName}
                              />
                              <AvatarFallback>
                                {student.firstName.charAt(0)}
                                {student.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.admissionNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* Read-only view */}
                          {hasExistingRecords && !isEditMode ? (
                            <div className="flex justify-center">
                              <span
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium",
                                  config.badgeVariant,
                                )}
                              >
                                {config.icon}
                                <span>{config.label}</span>
                              </span>
                            </div>
                          ) : (
                            /* Editable status buttons */
                            <div className="flex justify-center gap-2">
                              {(
                                Object.keys(statusConfig) as AttendanceStatus[]
                              ).map((status) => {
                                const sc = statusConfig[status];
                                const isActive = currentStatus === status;

                                return (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      handleStatusChange(student.id, status)
                                    }
                                    className={cn(
                                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-all",
                                      isActive
                                        ? sc.className
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted",
                                    )}
                                  >
                                    {sc.icon}
                                    <span className="hidden sm:inline">
                                      {sc.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
