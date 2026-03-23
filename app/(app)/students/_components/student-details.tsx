"use client";

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Student } from "@/types";

interface StudentDetailsProps {
  student: Student;
}

function getStatusBadge(status: Student["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "graduated":
      return <Badge className="bg-blue-100 text-blue-800">Graduated</Badge>;
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function StudentDetails({ student }: StudentDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={student.passportUrl}
                  alt={student.firstName}
                />
                <AvatarFallback className="text-2xl">
                  {student.firstName.charAt(0)}
                  {student.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-bold">
                {student.firstName}{" "}
                {student.middleName ? `${student.middleName} ` : ""}
                {student.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {student.admissionNumber}
              </p>
              <div className="mt-4 pb-4">{getStatusBadge(student.status)}</div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Class</p>
                  <p>{student.className || "Not assigned"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    Enrollment Date
                  </p>
                  <p>
                    {student.enrollmentDate
                      ? format(new Date(student.enrollmentDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Gender</p>
                  <p className="capitalize">{student.gender}</p>
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
                  <p>{student.email || "No email provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Phone</p>
                  <p>{student.phone || "No phone provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm sm:col-span-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Address</p>
                  <p>{student.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Guardian Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {student.guardians.map((guardian, index) => (
                <div key={guardian.id || index} className="space-y-4">
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        {guardian.firstName} {guardian.lastName}
                      </h4>
                      {guardian.isPrimary && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold text-primary border-primary"
                        >
                          Primary
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary">{guardian.relationship}</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p>{guardian.email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{guardian.phone}</p>
                    </div>
                    <div className="flex items-start gap-3 text-sm sm:col-span-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <p>{guardian.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
