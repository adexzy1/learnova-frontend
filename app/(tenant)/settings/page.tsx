"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RolesManager from "@/components/settings/roles-manager/roles-manager";
import SchoolProfileManager from "@/components/settings/school-profile/school-profile-manager";
import AcademicConfigManager from "@/components/settings/academic-config/academic-config-manager";
import BrandingManager from "@/components/settings/branding/branding-manager";
import NotificationsManager from "@/components/settings/notifications/notifications-manager";
import { useTenantSettings } from "@/components/settings/service/settings.service";

export default function SettingsPage() {
  const { settings, isLoading, isError, error } = useTenantSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">
          Loading settings...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-600">
        Error loading settings: {(error as any)?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure school profile and system preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic Configuration</TabsTrigger>
          <TabsTrigger value="branding">Branding & Appearance</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <SchoolProfileManager data={settings} />
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <AcademicConfigManager data={settings} />
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <BrandingManager data={settings} />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RolesManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsManager data={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
