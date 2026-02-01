"use client";

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
import { Download, Calendar, Filter } from "lucide-react";

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

import { PageHeader } from "@/components/shared/page-header";

// Mock Data
const ATTENDANCE_DATA = [
  { name: "Week 1", present: 95, absent: 5 },
  { name: "Week 2", present: 92, absent: 8 },
  { name: "Week 3", present: 96, absent: 4 },
  { name: "Week 4", present: 94, absent: 6 },
];

const FINANCE_DATA = [
  { name: "JSS 1", paid: 85, unpaid: 15 },
  { name: "JSS 2", paid: 70, unpaid: 30 },
  { name: "JSS 3", paid: 90, unpaid: 10 },
  { name: "SSS 1", paid: 65, unpaid: 35 },
  { name: "SSS 2", paid: 80, unpaid: 20 },
  { name: "SSS 3", paid: 95, unpaid: 5 },
];

const PERFORMANCE_DATA = [
  { name: "A (Excellent)", value: 150, color: "#22c55e" },
  { name: "B (Very Good)", value: 200, color: "#3b82f6" },
  { name: "C (Good)", value: 100, color: "#eab308" },
  { name: "D (Pass)", value: 40, color: "#f97316" },
  { name: "F (Fail)", value: 10, color: "#ef4444" },
];

export default function ReportsPage() {
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
            <Select defaultValue="term-1">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term-1">1st Term 2024/25</SelectItem>
                <SelectItem value="term-2">2nd Term 2024/25</SelectItem>
                <SelectItem value="term-3">3rd Term 2024/25</SelectItem>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Weekly attendance overview for this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ATTENDANCE_DATA}>
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Legend />
                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection by Class</CardTitle>
            <CardDescription>
              Percentage breakdown of paid vs unpaid fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FINANCE_DATA} layout="vertical">
                  <XAxis
                    type="number"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Legend />
                  <Bar
                    dataKey="paid"
                    name="Paid"
                    stackId="a"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="unpaid"
                    name="Unpaid"
                    stackId="a"
                    fill="#eab308"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>
              Grade distribution across all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PERFORMANCE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PERFORMANCE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Average Attendance
                </p>
                <p className="text-2xl font-bold">94.5%</p>
              </div>
              <div className="h-2 w-20 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[94%]"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fee Recovery
                </p>
                <p className="text-2xl font-bold">78%</p>
              </div>
              <div className="h-2 w-20 bg-yellow-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[78%]"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pass Rate
                </p>
                <p className="text-2xl font-bold">88%</p>
              </div>
              <div className="h-2 w-20 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[88%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
