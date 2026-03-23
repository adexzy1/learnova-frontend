"use client";
import { Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { NotificationPreferences } from "../types";
import { useUpdateNotificationPreferences } from "./service/notifications.service";

interface NotificationsManagerProps {
  data?: NotificationPreferences;
}

export default function NotificationsManager({
  data,
}: NotificationsManagerProps) {
  const { updateNotifications, isPending } = useUpdateNotificationPreferences();
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailNotificationsEnabled: data?.emailNotificationsEnabled ?? false,
    smsAlertsEnabled: data?.smsAlertsEnabled ?? false,
    inAppNotificationsEnabled: data?.inAppNotificationsEnabled ?? false,
  });

  const handleSave = async () => {
    await updateNotifications(prefs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how system alerts are delivered.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive daily summaries and critical alerts via email.
            </p>
          </div>
          <Switch
            checked={prefs.emailNotificationsEnabled}
            onCheckedChange={(checked) =>
              setPrefs({ ...prefs, emailNotificationsEnabled: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">SMS Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Send urgent messages to registered phone numbers.
            </p>
          </div>
          <Switch
            checked={prefs.smsAlertsEnabled}
            onCheckedChange={(checked) =>
              setPrefs({ ...prefs, smsAlertsEnabled: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">In-App Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Show badges and banners within the application.
            </p>
          </div>
          <Switch
            checked={prefs.inAppNotificationsEnabled}
            onCheckedChange={(checked) =>
              setPrefs({ ...prefs, inAppNotificationsEnabled: checked })
            }
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
