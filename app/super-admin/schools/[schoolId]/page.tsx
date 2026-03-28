"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  Users,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDate } from "@/lib/format";
import axiosClient from "@/lib/axios-client";
import { TENANT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";

import { SubscriptionManager } from "../_components/subscription-manager";
import { useSchoolDetailsService } from "../_services/use-school-details-service";

interface TenantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

interface TenantUsersResponse {
  data: TenantUser[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const STATUS_MAP: Record<number, { label: string; variant: "default" | "destructive" | "outline" | "secondary"; className?: string }> = {
  0: { label: "Pending", variant: "outline", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  1: { label: "Active", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  2: { label: "Failed", variant: "destructive" },
};

export default function SchoolDetailsPage() {
  const { school, isLoading } = useSchoolDetailsService();
  const [usersPage, setUsersPage] = useState(1);

  const schoolId = school?.id;

  const { data: usersResponse, isLoading: usersLoading } = useQuery<
    AxiosResponse<{ data: TenantUsersResponse }>
  >({
    queryKey: [queryKeys.TENANTS, schoolId, "users", usersPage],
    queryFn: () =>
      axiosClient.get(
        TENANT_ENDPOINTS.GET_TENANT_USERS.replace(":id", String(schoolId)),
        { params: { page: usersPage, per_page: 10 } },
      ),
    enabled: !!schoolId,
  });

  const users = usersResponse?.data?.data?.data ?? [];
  const usersMeta = usersResponse?.data?.data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!school) {
    return <div>School not found</div>;
  }

  const statusInfo = STATUS_MAP[school.status] ?? { label: "Unknown", variant: "outline" as const };

  return (
    <div className="space-y-6">
      <PageHeader
        title={school.name}
        description={`Manage settings and view details for ${school.name}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Schools", href: "/super-admin/schools" },
          { label: school.name },
        ]}
        actions={
          <Badge variant={statusInfo.variant} className={statusInfo.className}>
            {statusInfo.label}
          </Badge>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>School Profile</CardTitle>
                <CardDescription>Basic school information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Domain</p>
                    <p className="text-sm text-muted-foreground">
                      {school.slug}.learnova.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(school.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={statusInfo.variant} className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Contact</CardTitle>
                <CardDescription>
                  Primary administrator for the school
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.admin ? (
                  <>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {school.admin.firstName?.[0]}
                          {school.admin.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {school.admin.firstName} {school.admin.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Administrator
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{school.admin.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{school.admin.phone || "N/A"}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No admin user found.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick stats card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>At a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Users</span>
                  </div>
                  <span className="text-sm font-medium">
                    {school.userCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Plan</span>
                  </div>
                  <span className="text-sm font-medium">
                    {school.subscription?.plan?.name ?? "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Subscription
                    </span>
                  </div>
                  {school.subscription ? (
                    <Badge
                      variant="outline"
                      className={
                        school.subscription.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : school.subscription.status === "TRIAL"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : ""
                      }
                    >
                      {school.subscription.status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionManager tenant={school} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Users associated with this school
                {` (${school.userCount} total)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No users found for this school.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.phone ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.isActive ? "secondary" : "destructive"
                              }
                              className={
                                user.isActive
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : ""
                              }
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {user.lastLoginAt
                              ? format(
                                  new Date(user.lastLoginAt),
                                  "MMM d, yyyy",
                                )
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {usersMeta && usersMeta.lastPage > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {usersMeta.page} of {usersMeta.lastPage}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!usersMeta.hasPrevPage}
                          onClick={() => setUsersPage((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!usersMeta.hasNextPage}
                          onClick={() => setUsersPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
