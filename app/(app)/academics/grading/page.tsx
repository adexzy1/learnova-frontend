"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { PageHeader } from "@/components/shared/page-header";
import { gradingSystemSchema, type GradingSystemFormData } from "@/schemas";
import type { GradingSystem } from "@/types";
import useGradingService from "./_service/useGradingService";

export default function GradingPage() {
  const {
    gradingSystems,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingSystem,
    setEditingSystem,
    handleEdit,
    createMutation,
    updateMutation,
    setDefaultMutation,
  } = useGradingService();

  const form = useForm<GradingSystemFormData>({
    resolver: zodResolver(gradingSystemSchema),
    defaultValues: {
      name: "",
      grades: [{ grade: "", minScore: 0, maxScore: 100, gradePoint: 0, remark: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "grades",
  });

  // Sync form when editing system changes
  useEffect(() => {
    if (editingSystem) {
      form.reset({
        name: editingSystem.name,
        grades: editingSystem.grades,
      });
    } else {
      form.reset({
        name: "",
        grades: [{ grade: "", minScore: 0, maxScore: 100, gradePoint: 0, remark: "" }],
      });
    }
  }, [editingSystem, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const onSubmit = (data: GradingSystemFormData) => {
    if (editingSystem) {
      updateMutation.mutate({ id: editingSystem.id, payload: data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Grading Systems"
          description="Configure grading rules and score interpretations"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academics", href: "/academics" },
            { label: "Grading" },
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grading Systems"
        description="Configure grading rules and score interpretations"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics", href: "/academics" },
          { label: "Grading" },
        ]}
        actions={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingSystem(null);
                form.reset({
                  name: "",
                  grades: [{ grade: "", minScore: 0, maxScore: 100, gradePoint: 0, remark: "" }],
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add System
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingSystem ? "Edit Grading System" : "Create Grading System"}
                </DialogTitle>
                <DialogDescription>
                  Define the grading logic for assessments.
                </DialogDescription>
              </DialogHeader>

              {mutationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{mutationError.message}</AlertDescription>
                </Alert>
              )}

              <ScrollArea className="flex-1 pr-4 -mr-4">
                <Form {...form}>
                  <form
                    id="grading-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 p-1"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Standard WAEC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel>Grade Scale</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            append({
                              grade: "",
                              minScore: 0,
                              maxScore: 0,
                              gradePoint: 0,
                              remark: "",
                            })
                          }
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Grade
                        </Button>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                          <div className="col-span-2">Grade</div>
                          <div className="col-span-2">Min Score</div>
                          <div className="col-span-2">Max Score</div>
                          <div className="col-span-2">Grade Point</div>
                          <div className="col-span-3">Remark</div>
                          <div className="col-span-1"></div>
                        </div>
                        <div className="space-y-3 p-4">
                          {fields.map((field, index) => (
                            <div
                              key={field.id}
                              className="grid grid-cols-12 gap-2 items-start"
                            >
                              <div className="col-span-2">
                                <FormField
                                  control={form.control}
                                  name={`grades.${index}.grade`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="A1" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="col-span-2">
                                <FormField
                                  control={form.control}
                                  name={`grades.${index}.minScore`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="0"
                                          {...field}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val === "" ? 0 : Number(val));
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="col-span-2">
                                <FormField
                                  control={form.control}
                                  name={`grades.${index}.maxScore`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="100"
                                          {...field}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val === "" ? 0 : Number(val));
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="col-span-2">
                                <FormField
                                  control={form.control}
                                  name={`grades.${index}.gradePoint`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="0.0"
                                          step="0.1"
                                          {...field}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val === "" ? 0 : Number(val));
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="col-span-3">
                                <FormField
                                  control={form.control}
                                  name={`grades.${index}.remark`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="e.g. Excellent" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="col-span-1 pt-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </ScrollArea>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" form="grading-form" disabled={isPending}>
                  {isPending ? "Saving..." : editingSystem ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {gradingSystems.map((system: GradingSystem) => (
          <Card key={system.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{system.name}</CardTitle>
                {system.isDefault && (
                  <CardDescription className="flex items-center mt-1 text-green-600">
                    <Check className="mr-1 h-3 w-3" /> Default System
                  </CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(system)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {!system.isDefault && (
                    <DropdownMenuItem onClick={() => setDefaultMutation.mutate(system.id)}>
                      <Star className="mr-2 h-4 w-4" />
                      Set as Default
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Grade</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead className="text-right">GPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {system.grades.map((g) => (
                    <TableRow key={g.grade}>
                      <TableCell className="font-medium">{g.grade}</TableCell>
                      <TableCell>
                        {g.minScore} - {g.maxScore}
                      </TableCell>
                      <TableCell className="text-right">{g.gradePoint}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
