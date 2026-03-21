"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, UserX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Staff, UserRole } from "@/types";

function getStatusBadge(status: Staff["status"]) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Active
        </Badge>
      );
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "on-leave":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          On Leave
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getRoleBadge(roleName: string) {
  const key = (roleName || "").toLowerCase().replace(/\s+/g, "-");
  return (
    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
      {roleName}
    </Badge>
  );
}

export const getColumns = (
  handleDeactivate: (staff: Staff) => void,
): ColumnDef<Staff>[] => [
  {
    accessorKey: "staffNumber",
    header: "Staff Number",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("staffNumber")}</span>
    ),
  },
  {
    id: "staff",
    header: "Staff Member",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={staff.photo || `/placeholder.svg`}
              alt={staff.firstName}
            />
            <AvatarFallback>
              {staff.firstName.charAt(0)}
              {staff.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {staff.firstName} {staff.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{staff.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Role",
    cell: ({ row }) => {
      const roles = (row.getValue("roles") as UserRole[]) || [];
      return (
        <div className="flex flex-wrap items-center gap-2">
          {roles.map((r) => (
            <span key={r.id}>{getRoleBadge(r.role?.name ?? "")}</span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/staff/${staff.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/staff/${staff.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {staff.status === "active" && (
              <DropdownMenuItem
                onClick={() => handleDeactivate(staff)}
                className="text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
