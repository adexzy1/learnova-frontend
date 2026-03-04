"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";

import { termSchema, type TermFormData } from "@/schemas";
import type { Term, Session } from "@/types";
import { queryKeys } from "@/app/constants/queryKeys";
import axiosClient from "@/lib/axios-client";
import { SESSION_ENDPOINTS, TERM_ENDPOINTS } from "@/lib/api-routes";

interface TermFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Term | null;
}

export function TermFormDialog({
  open,
  onOpenChange,
  initialData,
}: TermFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<TermFormData>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      name: "",
      session: "",
      startDate: "",
      endDate: "",
      isActive: false,
    },
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery<
    AxiosResponse<Pick<Session, "id" | "name">[]>
  >({
    queryKey: [queryKeys.SESSION],
    queryFn: async () =>
      await axiosClient.get(SESSION_ENDPOINTS.GET_SELECTABLE_SESSIONS),
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        session: initialData.sessionId,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        isActive: initialData.isActive,
      });
    } else {
      form.reset({
        name: "",
        session: "",
        startDate: "",
        endDate: "",
        isActive: false,
      });
    }
  }, [initialData, form, open]);

  const mutation = useMutation({
    mutationFn: async (data: TermFormData) => {
      if (initialData) {
        const res = await axiosClient.patch(
          TERM_ENDPOINTS.UPDATE_TERM.replace(":id", initialData.id),
          data,
        );
        return res;
      } else {
        const res = await axiosClient.post(TERM_ENDPOINTS.CREATE_TERM, data);
        return res;
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.TERM] });
      toast.success(res.data.message);
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data: TermFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Term" : "Create Term"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the term details below."
              : "Add a new term to an academic session."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Session</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingSessions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessions?.data?.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Term" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Active Term</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Set this as the current active term
                    </p>
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Saving..."
                  : initialData
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
