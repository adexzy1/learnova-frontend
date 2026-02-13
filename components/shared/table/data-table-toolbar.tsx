import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DataTableToolbarProps {
  children?: ReactNode;
  className?: string;
}

export function DataTableToolbar({
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4 py-4", className)}
    >
      {children}
    </div>
  );
}
