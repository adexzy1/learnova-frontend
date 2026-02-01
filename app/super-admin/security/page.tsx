"use client";

import { Shield, Lock, Key, AlertTriangle } from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Settings"
        description="Manage authentication, access control, and security policies."
        breadcrumbs={[
          { label: "Dashboard", href: "/super-admin" },
          { label: "Security" },
        ]}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication
            </CardTitle>
            <CardDescription>
              Configure authentication and password policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa">Two-Factor Authentication (2FA)</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all super admin accounts
                </p>
              </div>
              <Switch id="2fa" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sso">Single Sign-On (SSO)</Label>
                <p className="text-sm text-muted-foreground">
                  Enable SSO integration
                </p>
              </div>
              <Switch id="sso" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input id="max-login-attempts" type="number" defaultValue="5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Set password requirements for all users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="min-length">Minimum Password Length</Label>
              <Input id="min-length" type="number" defaultValue="8" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-uppercase">
                  Require Uppercase Letters
                </Label>
                <p className="text-sm text-muted-foreground">
                  At least one uppercase letter
                </p>
              </div>
              <Switch id="require-uppercase" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-numbers">Require Numbers</Label>
                <p className="text-sm text-muted-foreground">
                  At least one number
                </p>
              </div>
              <Switch id="require-numbers" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-special">
                  Require Special Characters
                </Label>
                <p className="text-sm text-muted-foreground">
                  At least one special character
                </p>
              </div>
              <Switch id="require-special" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-expiry">Password Expiry (days)</Label>
              <Input id="password-expiry" type="number" defaultValue="90" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Control
            </CardTitle>
            <CardDescription>
              Configure IP whitelisting and access restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ip-whitelist">IP Whitelisting</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Switch id="ip-whitelist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
              <Input
                id="allowed-ips"
                placeholder="192.168.1.1, 10.0.0.0/8"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of IPs or CIDR ranges
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cors-origins">CORS Allowed Origins</Label>
              <Input id="cors-origins" defaultValue="https://schoolsms.com" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible security actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Revoke All Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Force logout all users across all tenants
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Revoke All
              </Button>
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="font-medium">Reset All 2FA Tokens</p>
                <p className="text-sm text-muted-foreground">
                  Force all users to reconfigure 2FA
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Reset 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
}
