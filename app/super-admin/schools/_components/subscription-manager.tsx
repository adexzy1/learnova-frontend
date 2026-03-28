"use client";

import { CreditCard, Calendar, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Tenant } from "@/types";
import { formatDate } from "@/lib/format";

interface SubscriptionManagerProps {
  tenant: Tenant;
}

const SUB_STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  TRIAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function SubscriptionManager({ tenant }: SubscriptionManagerProps) {
  const sub = tenant.subscription;

  if (!sub) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No subscription found for this school.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Subscription Details</h3>
        <p className="text-sm text-muted-foreground">
          Current subscription and billing information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Plan & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="text-sm font-medium">
                {sub.plan?.name ?? "Unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-sm font-medium">
                {sub.plan
                  ? `₦${Number(sub.plan.price).toLocaleString()}/mo`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className={SUB_STATUS_STYLES[sub.status] ?? ""}
              >
                {sub.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Billing Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sub.trialStartAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Trial Start
                </span>
                <span className="text-sm font-medium">
                  {formatDate(sub.trialStartAt)}
                </span>
              </div>
            )}
            {sub.trialEndAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Trial End
                </span>
                <span className="text-sm font-medium">
                  {formatDate(sub.trialEndAt)}
                </span>
              </div>
            )}
            {sub.currentPeriodStart && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Period Start
                </span>
                <span className="text-sm font-medium">
                  {formatDate(sub.currentPeriodStart)}
                </span>
              </div>
            )}
            {sub.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Period End
                </span>
                <span className="text-sm font-medium">
                  {formatDate(sub.currentPeriodEnd)}
                </span>
              </div>
            )}
            {sub.nextPaymentDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Next Payment
                </span>
                <span className="text-sm font-medium">
                  {formatDate(sub.nextPaymentDate)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
