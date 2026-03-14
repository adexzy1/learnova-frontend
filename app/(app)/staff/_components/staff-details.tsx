"use client";

import {
  Mail,
  Phone,
  Calendar,
  UserCog,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Staff } from "@/types";

interface StaffDetailsProps {
  staff: Staff;
}

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

export function StaffDetails({ staff }: StaffDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={staff.photo} alt={staff.firstName} />
                <AvatarFallback className="text-2xl">
                  {staff.firstName.charAt(0)}
                  {staff.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-bold">
                {staff.firstName} {staff.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {staff.employeeId}
              </p>
              <div className="mt-4 pb-4">{getStatusBadge(staff.status)}</div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Role</p>
                  <p className="capitalize">
                    {staff.role.replace("-", " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    Hire Date
                  </p>
                  <p>
                    {staff.hireDate
                      ? format(new Date(staff.hireDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 text-sm">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Email</p>
                  <p>{staff.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Phone</p>
                  <p>{staff.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {staff.subjects && staff.subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Assigned Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {staff.subjects.map((subject, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {staff.classes && staff.classes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Assigned Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {staff.classes.map((cls, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
