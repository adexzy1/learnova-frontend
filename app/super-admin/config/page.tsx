"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api-client";
import { SUPER_ADMIN_CONFIG_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { ApiError } from "@/types";

interface SystemConfig {
  platformName: string;
  supportEmail: string;
  baseUrl: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  webhookSecret: string;
  testMode: boolean;
  storageBucket: string;
  awsRegion: string;
  maxFileSize: number;
}

const defaultConfig: SystemConfig = {
  platformName: "",
  supportEmail: "",
  baseUrl: "",
  maintenanceMode: false,
  allowRegistrations: true,
  smtpHost: "",
  smtpPort: 587,
  smtpEncryption: "TLS",
  smtpUsername: "",
  smtpPassword: "",
  fromEmail: "",
  stripePublishableKey: "",
  stripeSecretKey: "",
  webhookSecret: "",
  testMode: false,
  storageBucket: "",
  awsRegion: "",
  maxFileSize: 10,
};

export default function ConfigPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SystemConfig>(defaultConfig);

  const { data: configResponse, isLoading, error } = useQuery<
    AxiosResponse<SystemConfig>
  >({
    queryKey: [queryKeys.SUPER_ADMIN_CONFIG],
    queryFn: () => apiClient.get(SUPER_ADMIN_CONFIG_ENDPOINTS.GET),
  });

  useEffect(() => {
    if (configResponse?.data) {
      setForm({ ...defaultConfig, ...configResponse.data });
    }
  }, [configResponse]);

  const saveMutation = useMutation({
    mutationFn: (data: SystemConfig) =>
      apiClient.patch(SUPER_ADMIN_CONFIG_ENDPOINTS.UPDATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.SUPER_ADMIN_CONFIG] });
      toast.success("Configuration saved.");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  function update<K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Configuration"
          description="Manage global system settings and preferences."
          breadcrumbs={[
            { label: "Dashboard", href: "/super-admin" },
            { label: "Configuration" },
          ]}
        />
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load configuration. The config endpoint may be unavailable.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Configuration"
          description="Manage global system settings and preferences."
          breadcrumbs={[
            { label: "Dashboard", href: "/super-admin" },
            { label: "Configuration" },
          ]}
        />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration"
        description="Manage global system settings and preferences."
        breadcrumbs={[
          { label: "Dashboard", href: "/super-admin" },
          { label: "Configuration" },
        ]}
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure basic platform-wide settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" value={form.platformName} onChange={(e) => update("platformName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" value={form.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input id="base-url" value={form.baseUrl} onChange={(e) => update("baseUrl", e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable all tenant access</p>
                </div>
                <Switch id="maintenance-mode" checked={form.maintenanceMode} onCheckedChange={(v) => update("maintenanceMode", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-registrations">Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">Enable new schools to register</p>
                </div>
                <Switch id="allow-registrations" checked={form.allowRegistrations} onCheckedChange={(v) => update("allowRegistrations", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" value={form.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} placeholder="smtp.gmail.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" type="number" value={form.smtpPort} onChange={(e) => update("smtpPort", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-encryption">Encryption</Label>
                  <Input id="smtp-encryption" value={form.smtpEncryption} onChange={(e) => update("smtpEncryption", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input id="smtp-username" value={form.smtpUsername} onChange={(e) => update("smtpUsername", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input id="smtp-password" type="password" value={form.smtpPassword} onChange={(e) => update("smtpPassword", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input id="from-email" value={form.fromEmail} onChange={(e) => update("fromEmail", e.target.value)} placeholder="noreply@schoolsms.com" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
              <CardDescription>Configure payment processor for subscriptions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                <Input id="stripe-key" value={form.stripePublishableKey} onChange={(e) => update("stripePublishableKey", e.target.value)} placeholder="pk_live_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                <Input id="stripe-secret" type="password" value={form.stripeSecretKey} onChange={(e) => update("stripeSecretKey", e.target.value)} placeholder="sk_live_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                <Input id="webhook-secret" type="password" value={form.webhookSecret} onChange={(e) => update("webhookSecret", e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="test-mode">Test Mode</Label>
                  <p className="text-sm text-muted-foreground">Use Stripe test keys</p>
                </div>
                <Switch id="test-mode" checked={form.testMode} onCheckedChange={(v) => update("testMode", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Configuration</CardTitle>
              <CardDescription>Configure file storage provider.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storage-provider">Storage Provider</Label>
                <Input id="storage-provider" defaultValue="AWS S3" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bucket-name">Bucket Name</Label>
                <Input id="bucket-name" value={form.storageBucket} onChange={(e) => update("storageBucket", e.target.value)} placeholder="schoolsms-uploads" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws-region">AWS Region</Label>
                <Input id="aws-region" value={form.awsRegion} onChange={(e) => update("awsRegion", e.target.value)} placeholder="us-east-1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input id="max-file-size" type="number" value={form.maxFileSize} onChange={(e) => update("maxFileSize", Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
