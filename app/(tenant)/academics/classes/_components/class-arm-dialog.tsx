"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClassArm } from "../_hooks/useClassArm";
import { forwardRef, useImperativeHandle } from "react";

interface ClassArmDialogProps {
  classLevelId: string;
}

export interface ClassArmDialogRef {
  open: () => void;
}

export const ClassArmDialog = forwardRef<
  ClassArmDialogRef,
  ClassArmDialogProps
>(({ classLevelId }, ref) => {
  const {
    session,
    form,
    createArmMutation,
    handleOpenChange,
    armDialogOpen,
    setArmDialogOpen,
  } = useClassArm(classLevelId);

  useImperativeHandle(ref, () => ({
    open: () => setArmDialogOpen(true),
  }));

  return (
    <Dialog open={armDialogOpen} onOpenChange={setArmDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Class Arm</DialogTitle>
          <DialogDescription>
            Add a new arm to this class level.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              createArmMutation.mutate(data),
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arm Name</FormLabel>
                  <FormControl>
                    <Input placeholder="A, B, C..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {session?.data?.data?.map((session) => (
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createArmMutation.isPending}>
                {createArmMutation.isPending ? "Adding..." : "Add Arm"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

ClassArmDialog.displayName = "ClassArmDialog";
