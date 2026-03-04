"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Search,
  Filter,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { PageHeader } from "@/components/shared/page-header";
import { fetchStaff } from "@/lib/api";
import type { Staff } from "@/types";

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: staffDoc, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => fetchStaff(),
  });

  // Safe access to data array
  const staffList = staffDoc?.data || [];

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.firstName.toLowerCase().includes(search.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || staff.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage teaching and non-teaching staff"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "People", href: "/students" }, // Assuming under People or similar
          { label: "Staff" },
        ]}
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by Role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="support">Support Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.map((staff) => (
          <Card key={staff.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}`}
                />
                <AvatarFallback>
                  {staff.firstName[0]}
                  {staff.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <CardTitle className="text-base truncate">
                  {staff.firstName} {staff.lastName}
                </CardTitle>
                <CardDescription className="truncate flex items-center gap-1">
                  <UserCog className="h-3 w-3" />
                  {staff.role.replace("-", " ").toUpperCase()}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Edit Details</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{staff.phone}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {staff.subjects?.slice(0, 3).map((subject, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {staff.subjects && staff.subjects.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{staff.subjects.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">
              No staff members found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
