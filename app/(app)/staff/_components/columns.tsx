"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, UserX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Staff, UserRole } from "@/types";

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
            <Badge
              key={r.id}
              className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
            >
              {r.role?.name ?? ""}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return isActive ? (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Active
        </Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      );
    },
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
            {staff.isActive && (
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
