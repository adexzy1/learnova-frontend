"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffFormData } from "@/schemas";
import { useSelectableRoles } from "@/shared/service/useSelectableRoles";
import axiosClient from "@/lib/axios-client";
import { CLASS_ENDPOINTS, SUBJECT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";

interface StaffFormProps {
  onSubmit: (data: StaffFormData) => void;
  isLoading: boolean;
  title: string;
  form: ReturnType<typeof useForm<StaffFormData>>;
  submitLabel?: string;
  isEdit?: boolean;
}

export function StaffForm({
  onSubmit,
  isLoading,
  title,
  form,
  submitLabel = "Save Staff",
  isEdit = false,
}: StaffFormProps) {
  const roles = useSelectableRoles();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignments",
  });

  // Fetch class arms
  const { data: classArmsRes } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.CLASS_ARMS],
    queryFn: () => axiosClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  const classArms = classArmsRes?.data?.data || [];

  // Fetch subjects
  const { data: subjectsRes } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_SUBJECTS],
    queryFn: () => axiosClient.get(SUBJECT_ENDPOINTS.GET_SELECTABLE_SUBJECTS),
  });

  const subjects = subjectsRes?.data?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : submitLabel}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sarah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Williams" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="sarah@school.com"
                        disabled={isEdit}
                        {...field}
                      />
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
            </CardContent>
          </Card>

          {/* Role & Account */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The role determines what permissions this staff member
                      will have in the system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEdit && (
                <FormField
                  control={form.control}
                  name="createUserAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Create Login Account
                        </FormLabel>
                        <FormDescription>
                          Allow this staff member to log in to the system. Turn
                          off if you only need a staff profile.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Class & Subject Assignments */}
        {!isEdit && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class & Subject Assignments</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Assign this staff member to teach subjects in specific
                  classes. You can also do this later from the staff profile.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ classArmId: "", subjectId: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  No assignments added. Click &quot;Add&quot; to assign classes
                  and subjects.
                </p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3">
                      <FormField
                        control={form.control}
                        name={`assignments.${index}.classArmId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            {index === 0 && <FormLabel>Class</FormLabel>}
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {classArms.map((arm) => (
                                  <SelectItem key={arm.id} value={arm.id}>
                                    {arm.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`assignments.${index}.subjectId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            {index === 0 && <FormLabel>Subject</FormLabel>}
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjects.map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id}>
                                    {sub.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 text-destructive hover:text-destructive ${index === 0 ? "mt-8" : ""}`}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
