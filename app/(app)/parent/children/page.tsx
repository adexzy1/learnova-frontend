"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useChildSelector } from "../ChildSelectorContext";

function ChildCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </CardContent>
    </Card>
  );
}

export default function ChildrenPage() {
  const { children, selectedChildId, setSelectedChildId, isLoading } = useChildSelector();

  return (
    <div className="space-y-6">
      <PageHeader title="My Children" />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ChildCardSkeleton />
          <ChildCardSkeleton />
          <ChildCardSkeleton />
        </div>
      ) : children.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No children linked to your account. Please contact the school administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card
              key={child.id}
              className={`cursor-pointer transition-colors hover:border-primary ${
                selectedChildId === child.id ? "border-primary ring-1 ring-primary" : ""
              }`}
              onClick={() => setSelectedChildId(child.id)}
            >
              <CardContent className="p-6 space-y-1">
                <p className="font-semibold text-base">
                  {child.firstName} {child.lastName}
                </p>
                {child.className && (
                  <p className="text-sm text-muted-foreground">Class: {child.className}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Admission No: {child.admissionNumber}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
