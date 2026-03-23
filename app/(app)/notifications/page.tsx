"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import {
  Bell,
  BellOff,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import useNotificationsService from "./_service/useNotificationsService";
import type { Notification } from "@/types";

const typeConfig: Record<
  Notification["type"],
  { icon: typeof Info; bg: string; fg: string; label: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-100 dark:bg-blue-950",
    fg: "text-blue-600 dark:text-blue-400",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-100 dark:bg-amber-950",
    fg: "text-amber-600 dark:text-amber-400",
    label: "Warning",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-100 dark:bg-emerald-950",
    fg: "text-emerald-600 dark:text-emerald-400",
    label: "Success",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-100 dark:bg-red-950",
    fg: "text-red-600 dark:text-red-400",
    label: "Error",
  },
};

function groupByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [];
  const buckets = new Map<string, Notification[]>();

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    let label: string;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else label = "Earlier";

    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(n);
  }

  // Maintain order: Today, Yesterday, Earlier
  for (const label of ["Today", "Yesterday", "Earlier"]) {
    const items = buckets.get(label);
    if (items?.length) groups.push({ label, items });
  }

  return groups;
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;
  const isUnread = !notification.isRead;

  const inner = (
    <div
      className={`group relative flex items-start gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50 ${
        isUnread ? "bg-primary/[0.03]" : ""
      }`}
    >
      {/* Unread dot */}
      {isUnread && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
      )}

      {/* Icon badge */}
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}
      >
        <Icon className={`h-4 w-4 ${config.fg}`} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm leading-snug ${
              isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"
            }`}
          >
            {notification.title}
          </p>
          {notification.link && (
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
        <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <span className="text-xs text-muted-foreground/70 mt-1 block">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>

      {/* Mark read button */}
      {isUnread && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
            >
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark as read</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        className="block"
        onClick={() => {
          if (isUnread) onMarkRead(notification.id);
        }}
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

function NotificationList({
  notifications,
  onMarkRead,
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}) {
  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const groups = useMemo(() => groupByDate(sorted), [sorted]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <BellOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No notifications
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          You&apos;re all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.label}
            </span>
          </div>
          <div>
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkRead}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    unreadCount,
    markReadMutation,
    markAllReadMutation,
  } = useNotificationsService();

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with what's happening"
        actions={
          <>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1.5 text-xs"
                >
                  {unreadCount}
                </Badge>
              </Button>
            )}
          </>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-1.5">
            Unread
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="h-4.5 min-w-4.5 px-1.5 text-[10px] leading-none"
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <Separator className="mt-4" />

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <NotificationsSkeleton />
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          {isLoading ? (
            <NotificationsSkeleton />
          ) : (
            <NotificationList
              notifications={unreadNotifications}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
