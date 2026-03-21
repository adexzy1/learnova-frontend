"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import useNotificationsService from "./_service/useNotificationsService";
import type { Notification } from "@/types";

const typeConfig: Record<
  Notification["type"],
  { icon: typeof Info; className: string; label: string }
> = {
  info: { icon: Info, className: "text-blue-600", label: "Info" },
  warning: { icon: AlertTriangle, className: "text-amber-600", label: "Warning" },
  success: { icon: CheckCircle, className: "text-green-600", label: "Success" },
  error: { icon: XCircle, className: "text-red-600", label: "Error" },
};

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
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
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered =
    typeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === typeFilter);

  // Sort by createdAt descending (reverse chronological)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        actions={
          <>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending || unreadCount === 0}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          </>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <NotificationsSkeleton />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;
            const content = (
              <Card
                className={`transition-colors ${!notification.isRead ? "border-primary/30 bg-primary/5" : ""}`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <span className={`mt-0.5 shrink-0 ${config.className}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markReadMutation.mutate(notification.id);
                      }}
                    >
                      Mark read
                    </Button>
                  )}
                </CardContent>
              </Card>
            );

            if (notification.link) {
              return (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className="block"
                  onClick={() => {
                    if (!notification.isRead) {
                      markReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  {content}
                </Link>
              );
            }

            return <div key={notification.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
