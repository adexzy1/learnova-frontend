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

import { Tenant } from "@/types";
import { formatDate } from "@/lib/format";

interface ActionsProps {
  school: Tenant;
  onEdit: (school: Tenant) => void;
}

const ActionsCell = ({ school, onEdit }: ActionsProps) => {
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
          className={
            school.status === "Active" ? "text-red-600" : "text-green-600"
          }
        >
          {school.status === "Active" ? (
            <>
              <Ban className="mr-2 h-4 w-4" /> Suspend Tenant
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Activate Tenant
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const schoolsColumns = (
  onEdit: (school: Tenant) => void,
): ColumnDef<Tenant>[] => [
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
      return status === "Active" ? (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("plan")}
      </Badge>
    ),
  },
  {
    accessorKey: "trialEndAt",
    header: "Expiry",
    cell: ({ row }) => formatDate(row.getValue("trialEndAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell school={row.original} onEdit={onEdit} />,
  },
];
