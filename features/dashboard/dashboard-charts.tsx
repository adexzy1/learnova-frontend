"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";

interface DashboardChartsProps {
  attendanceChart?: { date: string; present: number; absent: number }[];
  revenueChart?: { month: string; income: number; expense: number }[];
  gradeDistribution?: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  attendanceLoading?: boolean;
  revenueLoading?: boolean;
  academicLoading?: boolean;
}

// ── Chart configs ──────────────────────────────────────────────────

const attendanceConfig = {
  present: { label: "Present", color: "hsl(var(--primary))" },
  absent: { label: "Absent", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const revenueConfig = {
  income: { label: "Income", color: "hsl(var(--primary))" },
  expense: { label: "Expense", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const performanceConfig = {
  A: { label: "A (Excellent)", color: "#22c55e" },
  B: { label: "B (Very Good)", color: "#3b82f6" },
  C: { label: "C (Good)", color: "#eab308" },
  D: { label: "D (Fair)", color: "#f97316" },
  F: { label: "F (Fail)", color: "#ef4444" },
} satisfies ChartConfig;

// ── Helpers ────────────────────────────────────────────────────────

function formatDay(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  } catch {
    return dateStr;
  }
}

function formatMonth(monthStr: string) {
  try {
    const [year, month] = monthStr.split("-");
    const d = new Date(Number(year), Number(month) - 1);
    return d.toLocaleDateString("en-US", { month: "short" });
  } catch {
    return monthStr;
  }
}

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <Skeleton className="h-[250px] w-full rounded-lg" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
      {message}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────

export function DashboardCharts({
  attendanceChart = [],
  revenueChart = [],
  gradeDistribution,
  attendanceLoading,
  revenueLoading,
  academicLoading,
}: DashboardChartsProps) {
  const attendanceData = attendanceChart.map((d) => ({
    day: formatDay(d.date),
    present: d.present,
    absent: d.absent,
  }));

  const revenueData = revenueChart.map((d) => ({
    month: formatMonth(d.month),
    income: d.income,
    expense: d.expense,
  }));

  const performanceData = gradeDistribution
    ? [
        { name: "A", value: gradeDistribution.A, fill: "var(--color-A)" },
        { name: "B", value: gradeDistribution.B, fill: "var(--color-B)" },
        { name: "C", value: gradeDistribution.C, fill: "var(--color-C)" },
        { name: "D", value: gradeDistribution.D, fill: "var(--color-D)" },
        { name: "F", value: gradeDistribution.F, fill: "var(--color-F)" },
      ]
    : [];

  const totalGrades = performanceData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>
          Key metrics and trends for the current term
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* ── Attendance Tab ───────────────────────────────────── */}
          <TabsContent value="attendance">
            {attendanceLoading ? (
              <ChartSkeleton />
            ) : attendanceData.length === 0 ? (
              <EmptyState message="No attendance data available" />
            ) : (
              <ChartContainer config={attendanceConfig} className="w-full">
                <BarChart data={attendanceData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="present"
                    fill="var(--color-present)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    fill="var(--color-absent)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>

          {/* ── Revenue Tab ──────────────────────────────────────── */}
          <TabsContent value="revenue">
            {revenueLoading ? (
              <ChartSkeleton />
            ) : revenueData.length === 0 ? (
              <EmptyState message="No revenue data available" />
            ) : (
              <ChartContainer config={revenueConfig} className="w-full">
                <LineChart data={revenueData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      value >= 1_000_000
                        ? `₦${(value / 1_000_000).toFixed(0)}M`
                        : value >= 1_000
                          ? `₦${(value / 1_000).toFixed(0)}K`
                          : `₦${value}`
                    }
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {revenueConfig[name as keyof typeof revenueConfig]
                                ?.label ?? name}
                              :
                            </span>
                            <span className="font-mono font-medium">
                              ₦{Number(value).toLocaleString()}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--color-income)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-income)", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="var(--color-expense)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-expense)", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </TabsContent>

          {/* ── Performance Tab ──────────────────────────────────── */}
          <TabsContent value="performance">
            {academicLoading ? (
              <ChartSkeleton />
            ) : performanceData.length === 0 ||
              performanceData.every((d) => d.value === 0) ? (
              <EmptyState message="No performance data available" />
            ) : (
              <ChartContainer
                config={performanceConfig}
                className="mx-auto  w-full"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" hideLabel />}
                  />
                  <Pie
                    data={performanceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    strokeWidth={2}
                  >
                    {performanceData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {totalGrades}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Entries
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
