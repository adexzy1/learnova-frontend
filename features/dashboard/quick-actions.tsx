"use client";

import Link from "next/link";
import {
  UserPlus,
  ClipboardCheck,
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import { PERMISSIONS } from "@/app/constants/permissions";

const actions = [
  {
    title: "Add Student",
    description: "Register a new student",
    icon: UserPlus,
    href: "/students/new",
    permission: PERMISSIONS.ACADEMIC_MANAGE,
    color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
  },
  {
    title: "Enter CA Scores",
    description: "Record assessment scores",
    icon: ClipboardCheck,
    href: "/assessments/ca",
    permission: PERMISSIONS.ACADEMIC_MANAGE,
    color: "bg-green-100 text-green-600 hover:bg-green-200",
  },
  {
    title: "Mark Attendance",
    description: "Record daily attendance",
    icon: Calendar,
    href: "/attendance",
    permission: PERMISSIONS.ACADEMIC_MANAGE,
    color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
  },
  {
    title: "Create Invoice",
    description: "Generate new invoice",
    icon: CreditCard,
    href: "/finance/invoices/new",
    permission: PERMISSIONS.FINANCE_MANAGE,
    color: "bg-orange-100 text-orange-600 hover:bg-orange-200",
  },
  {
    title: "View Results",
    description: "Check term results",
    icon: FileText,
    href: "/results",
    permission: PERMISSIONS.ACADEMIC_VIEW,
    color: "bg-pink-100 text-pink-600 hover:bg-pink-200",
  },
  {
    title: "Send Message",
    description: "Compose a message",
    icon: MessageSquare,
    href: "/communications/messages/new",
    permission: PERMISSIONS.COMMUNICATION_SEND,
    color: "bg-cyan-100 text-cyan-600 hover:bg-cyan-200",
  },
];

export function QuickActions() {
  const { can } = usePermission();

  const visibleActions = actions.filter((action) => can(action.permission));

  if (visibleActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you can perform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.href}
                variant="outline"
                asChild
                className="h-auto flex-col gap-2 py-4 px-3 bg-transparent"
              >
                <Link href={action.href}>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
