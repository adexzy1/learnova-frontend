"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "@/components/shared/page-header";
import { fetchStudent, fetchTermResults } from "@/lib/api";

// Mock current student ID
const CURRENT_STUDENT_ID = "student-1";
const CURRENT_TERM_ID = "term-1";

export default function StudentDashboard() {
  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ["student", CURRENT_STUDENT_ID],
    queryFn: () => fetchStudent(CURRENT_STUDENT_ID),
  });

  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: ["results", CURRENT_STUDENT_ID, CURRENT_TERM_ID],
    queryFn: () => fetchTermResults(CURRENT_STUDENT_ID, CURRENT_TERM_ID),
  });

  if (loadingStudent) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {student?.firstName} 👋
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening in your academic life today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results?.gpa || "3.50"}</div>
            <p className="text-xs text-muted-foreground">Top 10% of class</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">Present 48/50 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 Assignments, 1 Project
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Exam</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Days</div>
            <p className="text-xs text-muted-foreground">Physics CA Test</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest academic updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Chemistry Assignment Due",
                  time: "2 hours ago",
                  type: "urgent",
                },
                {
                  title: "Math Result Published",
                  time: "Yesterday",
                  type: "info",
                },
                {
                  title: "School Fees Acknowledged",
                  time: "2 days ago",
                  type: "success",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <Badge
                    variant={
                      item.type === "urgent" ? "destructive" : "secondary"
                    }
                  >
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMMM d")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "08:00 AM", subject: "Mathematics", room: "Hall A" },
                {
                  time: "09:30 AM",
                  subject: "English Language",
                  room: "Class 1B",
                },
                { time: "11:00 AM", subject: "Physics", room: "Lab 1" },
                { time: "01:00 PM", subject: "Lunch Break", room: "Cafeteria" },
              ].map((slot, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 pb-4 last:pb-0 last:mb-0 border-l-2 border-primary/20 pl-4 relative"
                >
                  <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {slot.subject}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{slot.time}</span>
                      <span>•</span>
                      <span>{slot.room}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
