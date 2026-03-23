"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import {
  Users,
  CreditCard,
  FileText,
  MessageSquare,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useChildSelector } from "@/app/(app)/parent/ChildSelectorContext";
import apiClient from "@/lib/api-client";
import { GUARDIAN_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { format } from "date-fns";

interface ChildStats {
  resultStatus: string;
  resultTerm: string;
  outstandingFees: number;
  feesDueDate: string | null;
  attendancePercentage: number;
  unreadMessages: number;
}

export default function ParentDashboard() {
  const { children, selectedChildId, setSelectedChildId, isLoading: childrenLoading } = useChildSelector();

  const currentChild = children.find((c) => c.id === selectedChildId);

  const { data: statsResponse, isLoading: statsLoading } = useQuery<AxiosResponse<ChildStats>>({
    queryKey: [queryKeys.MY_CHILDREN, "stats", selectedChildId],
    queryFn: () =>
      apiClient.get(
        GUARDIAN_ENDPOINTS.GET_CHILD_STATS.replace(":childId", selectedChildId!)
      ),
    enabled: !!selectedChildId,
  });

  const stats = statsResponse?.data;

  if (childrenLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parent Portal</h2>
          <p className="text-muted-foreground">
            Monitor your children&apos;s progress and stay connected.
          </p>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No children linked to your account yet. Please contact the school administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parent Portal</h2>
          <p className="text-muted-foreground">
            Monitor your children&apos;s progress and stay connected.
          </p>
        </div>
        {children.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Viewing:
            </span>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedChildId ?? ""}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Results
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.resultStatus ?? "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.resultTerm ?? "—"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Fees
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${(stats?.outstandingFees ?? 0) > 0 ? "text-red-500" : ""}`}>
                  {stats?.outstandingFees != null
                    ? `₦${stats.outstandingFees.toLocaleString()}`
                    : "₦0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.feesDueDate
                    ? `Due ${format(new Date(stats.feesDueDate), "MMM d, yyyy")}`
                    : "No outstanding fees"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.attendancePercentage != null
                    ? `${stats.attendancePercentage}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current Term Average
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.unreadMessages != null
                    ? `${stats.unreadMessages} New`
                    : "0 New"}
                </div>
                <p className="text-xs text-muted-foreground">Unread messages</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {currentChild && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>
                Child Profile - {currentChild.firstName} {currentChild.lastName}
              </CardTitle>
              <CardDescription>
                {currentChild.className ?? currentChild.classArm ?? "—"}
                {currentChild.dateOfBirth &&
                  ` • ${format(new Date(currentChild.dateOfBirth), "do MMMM, yyyy")}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="h-32 w-32 border-4 border-muted">
                  <AvatarImage src={currentChild.passportUrl} />
                  <AvatarFallback>
                    {currentChild.firstName[0]}
                    {currentChild.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Admission Number
                      </p>
                      <p className="font-medium">{currentChild.admissionNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Class</p>
                      <p className="font-medium">
                        {currentChild.className ?? currentChild.classArm ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {currentChild.dateOfBirth
                          ? format(new Date(currentChild.dateOfBirth), "do MMMM, yyyy")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="secondary" className="capitalize">
                        {currentChild.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">View Full Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
