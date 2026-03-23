"use client";

import { useState } from "react";
import {
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  PenSquare,
  PlayCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/shared/page-header";

// Mock Data
const EXAMS = [
  {
    id: "exam-1",
    name: "Batch A Entrance Exam",
    date: "2024-08-15",
    duration: 60,
    status: "scheduled",
    registered: 45,
    completed: 0,
  },
  {
    id: "exam-2",
    name: "Batch B Entrance Exam",
    date: "2024-09-01",
    duration: 60,
    status: "draft",
    registered: 12,
    completed: 0,
  },
  {
    id: "exam-3",
    name: "Scholarship Assessment",
    date: "2024-07-20",
    duration: 90,
    status: "completed",
    registered: 30,
    completed: 28,
  },
];

export default function EntranceExamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrance Examinations"
        description="Manage computer-based tests for new intakes"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admissions", href: "/admissions" },
          { label: "Entrance Exams" },
        ]}
        actions={
          <Button>
            <PenSquare className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold">3</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Active Exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm opacity-80">Next: Batch A (Aug 15)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Question Bank
              </CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250</div>
            <p className="text-xs text-muted-foreground text-green-600">
              +15 questions added today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              Based on last completed exam
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Sessions</CardTitle>
          <CardDescription>
            Scheduled and past entrance examinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXAMS.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(exam.date), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {exam.duration} mins
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-semibold">{exam.completed}</span> /{" "}
                      {exam.registered}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        exam.status === "completed"
                          ? "secondary"
                          : exam.status === "scheduled"
                            ? "default"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {exam.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Manage Questions</DropdownMenuItem>
                        <DropdownMenuItem>View Candidates</DropdownMenuItem>
                        {exam.status === "completed" && (
                          <DropdownMenuItem>View Results</DropdownMenuItem>
                        )}
                        {exam.status === "scheduled" && (
                          <DropdownMenuItem>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start Session
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
