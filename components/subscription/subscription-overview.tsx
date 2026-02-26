"use client";

import { format, differenceInDays, isPast } from "date-fns";
import {
  Crown,
  Calendar,
  Users,
  UserCog,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Subscription } from "@/types";

interface SubscriptionOverviewProps {
  subscription: Subscription | undefined;
  isLoading: boolean;
  onUpgrade: () => void;
  onRenew: () => void;
}

const statusConfig: Record<
  string,
  { label: string; variant: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    variant:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  trial: {
    label: "Trial",
    variant:
      "bg-blue-500/15 text-blue-700 border-blue-500/20 dark:text-blue-400",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  expired: {
    label: "Expired",
    variant: "bg-red-500/15 text-red-700 border-red-500/20 dark:text-red-400",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    variant:
      "bg-gray-500/15 text-gray-700 border-gray-500/20 dark:text-gray-400",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  past_due: {
    label: "Past Due",
    variant:
      "bg-amber-500/15 text-amber-700 border-amber-500/20 dark:text-amber-400",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

function UsageMeter({
  label,
  icon,
  used,
  max,
  unit,
}: {
  label: string;
  icon: React.ReactNode;
  used: number;
  max: number;
  unit?: string;
}) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const isHigh = pct > 80;
  const isUnlimited = max >= 99999;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-medium">
          {unit ? `${used} ${unit}` : used.toLocaleString()}
          {!isUnlimited && (
            <span className="text-muted-foreground">
              {" "}
              / {unit ? `${max} ${unit}` : max.toLocaleString()}
            </span>
          )}
          {isUnlimited && <span className="text-muted-foreground"> / ∞</span>}
        </span>
      </div>
      <Progress
        value={isUnlimited ? Math.min(pct, 10) : pct}
        className={`h-2 ${isHigh && !isUnlimited ? "[&>div]:bg-amber-500" : "[&>div]:bg-primary"}`}
      />
    </div>
  );
}

export function SubscriptionOverview({
  subscription,
  isLoading,
  onUpgrade,
  onRenew,
}: SubscriptionOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription) return null;

  const status = statusConfig[subscription.status] ?? statusConfig.active;
  const periodEnd = new Date(subscription.currentPeriodEnd);
  const daysRemaining = differenceInDays(periodEnd, new Date());
  const isExpiring = daysRemaining <= 14 && daysRemaining > 0;
  const isExpired = isPast(periodEnd) || subscription.status === "expired";

  // Trial-specific calculations
  const isTrial = subscription.status === "trial";
  let trialDaysLeft = 0;
  let trialProgress = 0;
  if (isTrial && subscription.trialEndAt) {
    const trialEnd = new Date(subscription.trialEndAt);
    trialDaysLeft = Math.max(0, differenceInDays(trialEnd, new Date()));
    const trialStart = new Date(subscription.createdAt);
    const totalTrialDays = differenceInDays(trialEnd, trialStart);
    trialProgress =
      totalTrialDays > 0
        ? ((totalTrialDays - trialDaysLeft) / totalTrialDays) * 100
        : 100;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Main subscription card */}
      <Card className="lg:col-span-2 overflow-hidden">
        <div className="h-1 w-full bg-linear-to-r from-primary via-primary/80 to-primary/40" />
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">
                  {subscription.plan.name} Plan
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`${status.variant} gap-1 font-medium`}
                >
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <CardDescription>{subscription.plan.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tracking-tight">
                ₦{subscription.plan.price.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                per {subscription.plan.interval}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trial countdown */}
          {isTrial && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Trial Period
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  {trialDaysLeft} days left
                </span>
              </div>
              <Progress
                value={trialProgress}
                className="h-2 [&>div]:bg-blue-500"
              />
              <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/70">
                Upgrade now to keep all your data when the trial ends.
              </p>
            </div>
          )}

          {/* Expiring soon warning */}
          {isExpiring && !isTrial && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Your subscription expires in {daysRemaining} days
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/70">
                Renew now to avoid service interruption.
              </p>
            </div>
          )}

          {/* Expired alert */}
          {isExpired && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  Your subscription has expired
                </span>
              </div>
              <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/70">
                Renew your subscription to regain full access.
              </p>
            </div>
          )}

          {/* Period info */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Current period:{" "}
                <span className="font-medium text-foreground">
                  {format(
                    new Date(subscription.currentPeriodStart),
                    "MMM d, yyyy",
                  )}{" "}
                  — {format(periodEnd, "MMM d, yyyy")}
                </span>
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={onUpgrade} className="gap-2">
              <Zap className="h-4 w-4" />
              {subscription.status === "trial" ? "Upgrade Now" : "Change Plan"}
            </Button>
            {(isExpiring || isExpired) && (
              <Button onClick={onRenew} variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Renew Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Resource Usage</CardTitle>
              <CardDescription>
                Current usage against your plan limits
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <UsageMeter
              label="Students"
              icon={<Users className="h-4 w-4" />}
              used={subscription.usage.students}
              max={subscription.plan.maxStudents}
            />
            <UsageMeter
              label="Staff"
              icon={<UserCog className="h-4 w-4" />}
              used={subscription.usage.staff}
              max={subscription.plan.maxStaff}
            />
            <UsageMeter
              label="Storage"
              icon={<HardDrive className="h-4 w-4" />}
              used={subscription.usage.storageUsed}
              max={subscription.plan.maxStorage}
              unit="GB"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
