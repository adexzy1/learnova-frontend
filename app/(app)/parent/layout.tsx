"use client";

import { ChildSelectorProvider, useChildSelector } from "./ChildSelectorContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function ChildSelectorStrip() {
  const { children, selectedChildId, setSelectedChildId, isLoading } = useChildSelector();

  if (isLoading) {
    return (
      <div className="border-b px-4 py-3">
        <Skeleton className="h-9 w-48" />
      </div>
    );
  }

  if (children.length === 0) return null;

  return (
    <div className="border-b px-4 py-3 flex items-center gap-3">
      <span className="text-sm text-muted-foreground font-medium">Viewing:</span>
      <Select value={selectedChildId ?? undefined} onValueChange={setSelectedChildId}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select child" />
        </SelectTrigger>
        <SelectContent>
          {children.map((child) => (
            <SelectItem key={child.id} value={child.id}>
              {child.firstName} {child.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChildSelectorProvider>
      <ChildSelectorStrip />
      {children}
    </ChildSelectorProvider>
  );
}
