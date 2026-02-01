"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PageHeader } from "@/components/shared/page-header";
import { fetchTerms, fetchSessions } from "@/lib/api";
import { termSchema, type TermFormData } from "@/schemas";
import type { Term } from "@/types";

export default function TermsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  const { data: terms, isLoading: isLoadingTerms } = useQuery({
    queryKey: ["terms"],
    queryFn: () => fetchTerms(),
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });

  const form = useForm<TermFormData>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      name: "",
      sessionId: "",
      startDate: "",
      endDate: "",
      isActive: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TermFormData) => {
      // Logic would be in a real API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success(editingTerm ? "Term updated!" : "Term created!");
      setDialogOpen(false);
      setEditingTerm(null);
      form.reset();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    form.reset({
      name: term.name,
      sessionId: term.sessionId,
      startDate: term.startDate,
      endDate: term.endDate,
      isActive: term.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    // Delete logic mock
    toast.success("Term deleted");
  };

  if (isLoadingTerms || isLoadingSessions) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Terms Management"
          description="Manage academic terms for each session"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academics", href: "/academics" },
            { label: "Terms" },
          ]}
        />
        <div className="space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terms Management"
        description="Manage academic terms for each session"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics", href: "/academics" },
          { label: "Terms" },
        ]}
        actions={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingTerm(null);
                form.reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Term
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTerm ? "Edit Term" : "Create Term"}
                </DialogTitle>
                <DialogDescription>
                  {editingTerm
                    ? "Update the term details."
                    : "Add a new term to an academic session."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="sessionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Session</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sessions?.map((session) => (
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Status
                          </FormLabel>
                          <DialogDescription>
                            Is this the current active term?
                          </DialogDescription>
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
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending
                        ? "Saving..."
                        : editingTerm
                          ? "Update"
                          : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terms?.map((term) => {
                const session = sessions?.find((s) => s.id === term.sessionId);
                return (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.name}</TableCell>
                    <TableCell>{session?.name || "Unknown Session"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(term.startDate), "MMM d, yyyy")} -{" "}
                      {format(new Date(term.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {term.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(term)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(term.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!terms || terms.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No terms found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
