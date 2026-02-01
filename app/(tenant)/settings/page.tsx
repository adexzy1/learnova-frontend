"use client";
import { Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/shared/page-header";

// Schema for School Settings
const schoolSettingsSchema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(10, "Address is required"),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export default function SettingsPage() {
  const form = useForm({
    resolver: zodResolver(schoolSettingsSchema),
    defaultValues: {
      schoolName: "LearnNova Academy",
      email: "contact@learnnova.com",
      phone: "+234 800 123 4567",
      address: "123 Education Street, Lagos",
      website: "https://learnnova.com",
      description: "Excellence in education.",
    },
  });

  function onSubmit(data: any) {
    console.log(data);
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
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>
                Publicly visible details about your school.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="schoolName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter school name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@school.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+234..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="123 Street..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Rules</CardTitle>
              <CardDescription>
                Configure promotion rules and grading defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Current Session</Label>
                  <Select defaultValue="2024-2025">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">
                        2024/2025 Session
                      </SelectItem>
                      <SelectItem value="2023-2024">
                        2023/2024 Session
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Term</Label>
                  <Select defaultValue="term-1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term-1">First Term</SelectItem>
                      <SelectItem value="term-2">Second Term</SelectItem>
                      <SelectItem value="term-3">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Promote Students</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically promote students who pass to the next class at
                    session end.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Lock Past Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent modification of results from previous terms.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end pt-4">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Look & Feel</CardTitle>
              <CardDescription>
                Customize the school portal appearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-12 p-1"
                      defaultValue="#2563eb"
                    />
                    <Input defaultValue="#2563eb" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>School Logo</Label>
                  <Input type="file" accept="image/*" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 200x200px (PNG)
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Update Branding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>
                  Manage user roles and access control levels.
                </CardDescription>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-4 p-4 font-medium border-b bg-muted/50">
                  <div className="col-span-1">Role Name</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1 text-right">Users</div>
                </div>
                {[
                  {
                    name: "Super Admin",
                    desc: "Full access to all system resources",
                    users: 2,
                  },
                  {
                    name: "School Admin",
                    desc: "Manage school-level settings and users",
                    users: 1,
                  },
                  {
                    name: "Teacher",
                    desc: "Access to assigned classes and subjects",
                    users: 45,
                  },
                  {
                    name: "Accountant",
                    desc: "Manage finances, fees, and invoices",
                    users: 3,
                  },
                ].map((role, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 p-4 border-b last:border-0 items-center"
                  >
                    <div className="col-span-1 font-medium">{role.name}</div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {role.desc}
                    </div>
                    <div className="col-span-1 text-right text-sm">
                      {role.users} users
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
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
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send urgent messages to registered phone numbers.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show badges and banners within the application.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end pt-4">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
