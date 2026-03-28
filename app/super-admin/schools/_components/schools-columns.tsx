"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  MoreHorizontal,
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  CreditCard,
  Ban,
  Check,
  Pencil,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TenantListItem } from "@/types";
import { formatDate } from "@/lib/format";

interface ActionsProps {
  school: TenantListItem;
  onEdit: (school: TenantListItem) => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  ACTIVE: { label: "Active", icon: CheckCircle2, className: "bg-green-600 hover:bg-green-700 text-white" },
  TRIAL: { label: "Trial", icon: Clock, className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
  EXPIRED: { label: "Expired", icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const ActionsCell = ({ school, onEdit }: ActionsProps) => {
  const isActive = school.status === "ACTIVE";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/super-admin/schools/${school.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(school)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Subscription
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={isActive ? "text-red-600" : "text-green-600"}
        >
          {isActive ? (
            <>
              <Ban className="mr-2 h-4 w-4" /> Suspend School
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Activate School
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const schoolsColumns = (
  onEdit: (school: TenantListItem) => void,
): ColumnDef<TenantListItem>[] => [
  {
    accessorKey: "name",
    header: "School Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 font-medium">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "domainName",
    header: "Domain",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = STATUS_CONFIG[status];
      if (!config) {
        return <Badge variant="outline">{status ?? "—"}</Badge>;
      }
      const Icon = config.icon;
      return (
        <Badge variant="outline" className={config.className}>
          <Icon className="mr-1 h-3 w-3" /> {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("plan") ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "trialEndAt",
    header: "Expiry",
    cell: ({ row }) => {
      const val = row.getValue("trialEndAt") as string | null;
      return val ? formatDate(val) : "—";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell school={row.original} onEdit={onEdit} />,
  },
];
