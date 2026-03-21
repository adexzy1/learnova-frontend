"use client";

import { useForm } from "react-hook-form";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { StaffFormData } from "@/schemas";
import { queryKeys } from "@/app/constants/queryKeys";
import { SUBJECT_ENDPOINTS, CLASS_ENDPOINTS } from "@/lib/api-routes";
import axiosClient from "@/lib/axios-client";
import { Subject, ClassArm } from "@/types";

interface StaffFormProps {
  onSubmit: (data: StaffFormData) => void;
  isLoading: boolean;
  title: string;
  form: ReturnType<typeof useForm<StaffFormData>>;
  submitLabel?: string;
}

export function StaffForm({
  onSubmit,
  isLoading,
  title,
  form,
  submitLabel = "Save Staff",
}: StaffFormProps) {
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);

  const selectedSubjects = form.watch("subjects") || [];
  const selectedClasses = form.watch("classes") || [];

  // Fetch subjects from API
  const { data: subjectsData } = useQuery<AxiosResponse<{ data: Subject[] }>>({
    queryKey: [queryKeys.SUBJECTS],
    queryFn: async () =>
      axiosClient.get(SUBJECT_ENDPOINTS.GET_SELECTABLE_SUBJECTS),
  });

  // Fetch class arms from API
  const { data: classesData } = useQuery<
    AxiosResponse<{ data: Pick<ClassArm, "id" | "name">[] }>
  >({
    queryKey: [queryKeys.CLASSES],
    queryFn: async () => axiosClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  const subjects = subjectsData?.data.data || [];
  const classArms = classesData?.data.data || [];

  const toggleSubject = (subjectName: string) => {
    const current = [...selectedSubjects];
    const index = current.indexOf(subjectName);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(subjectName);
    }
    form.setValue("subjects", current);
  };

  const removeSubject = (subjectName: string) => {
    form.setValue(
      "subjects",
      selectedSubjects.filter((s) => s !== subjectName),
    );
  };

  const toggleClass = (className: string) => {
    const current = [...selectedClasses];
    const index = current.indexOf(className);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(className);
    }
    form.setValue("classes", current);
  };

  const removeClass = (className: string) => {
    form.setValue(
      "classes",
      selectedClasses.filter((c) => c !== className),
    );
  };

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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="school-admin">
                          School Admin
                        </SelectItem>
                        <SelectItem value="finance-officer">
                          Finance Officer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Teaching Information */}
          <div className="space-y-6">
            {/* Subjects Combobox */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Subjects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                  <PopoverTrigger asChild className="w-full">
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={subjectsOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedSubjects.length > 0
                        ? `${selectedSubjects.length} subject(s) selected`
                        : "Select subjects..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search subjects..." />
                      <CommandList>
                        <CommandEmpty>No subjects found.</CommandEmpty>
                        <CommandGroup>
                          {subjects.map((subject) => (
                            <CommandItem
                              key={subject.id}
                              value={subject.name}
                              onSelect={() => toggleSubject(subject.name)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedSubjects.includes(subject.name)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {subject.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedSubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((subject, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {subject}
                        <button
                          type="button"
                          onClick={() => removeSubject(subject)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No subjects assigned yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Classes Combobox */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Popover open={classesOpen} onOpenChange={setClassesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={classesOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedClasses.length > 0
                        ? `${selectedClasses.length} class(es) selected`
                        : "Select classes..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search classes..." />
                      <CommandList>
                        <CommandEmpty>No classes found.</CommandEmpty>
                        <CommandGroup>
                          {classArms.map((cls) => (
                            <CommandItem
                              key={cls.id}
                              value={cls.name}
                              onSelect={() => toggleClass(cls.name)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClasses.includes(cls.name)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {cls.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedClasses.map((cls, i) => (
                      <Badge key={i} variant="outline" className="gap-1 pr-1">
                        {cls}
                        <button
                          type="button"
                          onClick={() => removeClass(cls)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No classes assigned yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
