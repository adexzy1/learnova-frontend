"use client";

import { Check, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Subject } from "@/types";

interface ColumnProps {
  handleEdit: (subject: Subject) => void;
  handleDelete: (subject: Subject) => void;
}

export const getColumns = ({
  handleEdit,
  handleDelete,
}: ColumnProps): ColumnDef<Subject>[] => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue("code")}
      </Badge>
    ),
  },
  {
    accessorKey: "name",
    header: "Subject Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm truncate max-w-xs block">
        {row.getValue("description") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.getValue("isActive") ? (
        <Badge className="gap-1">
          <Check className="h-3 w-3" />
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <X className="h-3 w-3" />
          Inactive
        </Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(row.original)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDelete(row.original)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
