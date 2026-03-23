"use client";

import { Mail, Phone, UserCog, Calendar } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Staff } from "@/types";

interface StaffDetailsProps {
  staff: Staff;
}

export function StaffDetails({ staff }: StaffDetailsProps) {
  const roleName =
    staff.roles?.[0]?.role?.name ?? "No role assigned";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {staff.firstName.charAt(0)}
                  {staff.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-bold">
                {staff.firstName} {staff.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {staff.staffNumber}
              </p>
              <div className="mt-4 pb-4">
                {staff.isActive ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Role</p>
                  <p className="capitalize">{roleName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    Joined
                  </p>
                  <p>
                    {staff.createdAt
                      ? format(new Date(staff.createdAt), "PPP")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
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
                  <p>{staff.phone || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Roles */}
          {staff.roles && staff.roles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Assigned Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {staff.roles.map((r) => (
                    <Badge key={r.id} variant="secondary" className="text-sm">
                      {r.role?.name}
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
