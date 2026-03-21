"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "@/components/shared/page-header";
import apiClient from "@/lib/api-client";
import { TERM_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import useReportsService from "./_service/useReportsService";
import type { Term } from "@/types";

const GRADE_COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
};

export default function ReportsPage() {
  const [selectedTermId, setSelectedTermId] = useState<string>("");

  const { data: termsResponse } = useQuery<AxiosResponse<Term[]>>({
    queryKey: [queryKeys.TERM, "select"],
    queryFn: () => apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS),
  });
  const terms = termsResponse?.data ?? [];

  const { attendanceData, feeData, performanceData, stats, isLoading } =
    useReportsService(selectedTermId || undefined);

  // Map performance data with colors
  const perfWithColors = performanceData.map((d) => ({
    name: d.grade,
    value: d.count,
    color: GRADE_COLORS[d.grade] ?? "#9ca3af",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive insights into school performance"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports" },
        ]}
        actions={
          <div className="flex gap-2">
            <Select value={selectedTermId} onValueChange={setSelectedTermId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[380px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>Attendance rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                  No attendance data available
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData.map((d) => ({ name: d.date, present: d.rate, absent: 100 - d.rate }))}>
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip cursor={{ fill: "transparent" }} />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee Collection by Class</CardTitle>
              <CardDescription>Collected vs outstanding fees</CardDescription>
            </CardHeader>
            <CardContent>
              {feeData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                  No fee data available
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feeData.map((d) => ({ name: d.className, paid: d.collected, unpaid: d.outstanding }))} layout="vertical">
                      <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={50} />
                      <Tooltip cursor={{ fill: "transparent" }} />
                      <Legend />
                      <Bar dataKey="paid" name="Paid" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="unpaid" name="Unpaid" stackId="a" fill="#eab308" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Grade distribution across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {perfWithColors.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                  No performance data available
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={perfWithColors} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {perfWithColors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Attendance</p>
                  <p className="text-2xl font-bold">{stats.avgAttendance.toFixed(1)}%</p>
                </div>
                <div className="h-2 w-20 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${Math.min(stats.avgAttendance, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fee Recovery</p>
                  <p className="text-2xl font-bold">{stats.feeRecovery.toFixed(0)}%</p>
                </div>
                <div className="h-2 w-20 bg-yellow-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${Math.min(stats.feeRecovery, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                  <p className="text-2xl font-bold">{stats.passRate.toFixed(0)}%</p>
                </div>
                <div className="h-2 w-20 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(stats.passRate, 100)}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
