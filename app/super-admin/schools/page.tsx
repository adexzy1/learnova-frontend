"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

import { SchoolFormDialog } from "./_components/school-form-dialog";
import { SchoolsTable } from "./_components/schools-table";
import { useSchoolsService } from "./_services/use-schools-service";
import { Input } from "@/components/ui/input";

export default function TenantManagementPage() {
  const {
    tenants,
    isLoading,
    pagination,
    setPagination,
    search,
    setSearch,
    pageCount,
    isCreateOpen,
    setIsCreateOpen,
    editingSchool,
    handleEdit,
    handleCreateOpen,
  } = useSchoolsService();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="Manage all schools and their subscriptions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Schools" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
          <CardDescription>
            Manage all schools and their subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search schools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <SchoolsTable
              isLoading={isLoading}
              onPaginationChange={setPagination}
              pageCount={pageCount}
              pagination={pagination}
              search={search}
              onSearchChange={setSearch}
              data={tenants || []}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      <SchoolFormDialog
        open={isCreateOpen}
        onOpenChange={handleCreateOpen}
        initialData={editingSchool}
      />
    </div>
  );
}
