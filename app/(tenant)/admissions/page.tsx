"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  FileCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Download,
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { PageHeader } from "@/components/shared/page-header";
import { fetchAdmissions } from "@/lib/api";

export default function AdmissionsPage() {
  const { data: admissionDoc, isLoading } = useQuery({
    queryKey: ["admissions"],
    queryFn: () => fetchAdmissions(),
  });

  // Safe access
  const applications = admissionDoc?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions Management"
        description="Process new student applications and admission workflow"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admissions" },
        ]}
        actions={
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Open Admission Portal
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+12 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">62% acceptance rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Mainly due to incomplete docs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Manage student intake for 2024/2025 Session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="interview">Interview</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Application No</TableHead>
                    <TableHead>Applied Class</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Exam Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {app.studentData.firstName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {app.studentData.firstName}{" "}
                              {app.studentData.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {app.studentData.gender}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {app.applicationNumber}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        JSS 1
                      </TableCell>
                      <TableCell>
                        {format(new Date(app.submittedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {app.entranceExamScore ? (
                          <Badge
                            variant="outline"
                            className={
                              app.entranceExamScore >= 50
                                ? "border-green-500 text-green-600"
                                : "border-red-500 text-red-600"
                            }
                          >
                            {app.entranceExamScore}%
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {app.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                              <DialogDescription>
                                {app.applicationNumber}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6 py-4">
                              <div className="space-y-4">
                                <h4 className="font-semibold text-sm">
                                  Personal Info
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span className="text-muted-foreground">
                                    Name:
                                  </span>
                                  <span>
                                    {app.studentData.firstName}{" "}
                                    {app.studentData.lastName}
                                  </span>
                                  <span className="text-muted-foreground">
                                    DOB:
                                  </span>
                                  <span>{app.studentData.dateOfBirth}</span>
                                  <span className="text-muted-foreground">
                                    Gender:
                                  </span>
                                  <span className="capitalize">
                                    {app.studentData.gender}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="font-semibold text-sm">
                                  Documents
                                </h4>
                                {app.documents.length > 0 ? (
                                  <div className="space-y-2">
                                    {app.documents.map((doc, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between p-2 border rounded-md text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <FileCheck className="h-4 w-4 text-primary" />
                                          <span>{doc.name}</span>
                                        </div>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No documents uploaded.
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t pt-4">
                              <Button
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                              >
                                Reject
                              </Button>
                              <Button>Approve for Exam</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
