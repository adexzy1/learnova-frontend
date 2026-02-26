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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AcademicConfig } from "../types";
import { useUpdateAcademicConfig } from "./service/academic-config.service";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AcademicConfigManagerProps {
  data?: AcademicConfig;
}

export default function AcademicConfigManager({
  data,
}: AcademicConfigManagerProps) {
  const { updateConfig, isPending, sessions, terms, form } =
    useUpdateAcademicConfig(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Rules</CardTitle>
        <CardDescription>
          Configure promotion rules and grading defaults.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(updateConfig)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="currentSessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Session</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Session" />
                        </SelectTrigger>
                        <SelectContent>
                          {sessions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentTermId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Term</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Term" />
                        </SelectTrigger>
                        <SelectContent>
                          {terms.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="autoPromoteStudents"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Promote Students</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically promote students who pass to the next class
                      at session end.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lockPastResults"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Lock Past Results</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent modification of results from previous terms.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
