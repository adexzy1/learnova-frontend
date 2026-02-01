"use client";

import { CheckCircle, XCircle, Clock, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

const PENDING_REQUESTS = [
  {
    id: "1",
    schoolName: "Greenwood Academy",
    contactName: "Dr. Sarah Johnson",
    email: "sarah@greenwood.edu",
    phone: "+234 803 456 7890",
    requestedPlan: "Pro",
    submittedDate: "2024-10-20",
    status: "pending",
  },
  {
    id: "2",
    schoolName: "Tech Valley School",
    contactName: "Mr. David Lee",
    email: "david@techvalley.edu",
    phone: "+234 901 234 5678",
    requestedPlan: "Enterprise",
    submittedDate: "2024-10-22",
    status: "reviewing",
  },
  {
    id: "3",
    schoolName: "Bright Future High",
    contactName: "Mrs. Grace Okafor",
    email: "grace@brightfuture.edu",
    phone: "+234 802 345 6789",
    requestedPlan: "Free",
    submittedDate: "2024-10-23",
    status: "pending",
  },
];

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Requests"
        description="Review and approve pending school registration requests."
        breadcrumbs={[
          { label: "Dashboard", href: "/super-admin" },
          { label: "Onboarding" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            {PENDING_REQUESTS.length} schools awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PENDING_REQUESTS.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.schoolName}
                  </TableCell>
                  <TableCell>{request.contactName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {request.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {request.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.requestedPlan}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {request.submittedDate}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "reviewing" ? "secondary" : "outline"
                      }
                      className={
                        request.status === "reviewing"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : ""
                      }
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      {request.status === "pending" ? "Pending" : "Reviewing"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="default">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
