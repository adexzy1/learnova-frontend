"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
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

import { PageHeader } from "@/components/shared/page-header";
import { gradingSystemSchema, type GradingSystemFormData } from "@/schemas";

// Mock Data Types
interface GradingSystem {
  id: string;
  name: string;
  grades: {
    letter: string;
    minScore: number;
    maxScore: number;
    gpa: number;
    remark: string;
  }[];
  isDefault: boolean;
}

// Mock API
const fetchGradingSystems = async (): Promise<GradingSystem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    {
      id: "gs-1",
      name: "Standard WAEC Grading",
      isDefault: true,
      grades: [
        {
          letter: "A1",
          minScore: 75,
          maxScore: 100,
          gpa: 5.0,
          remark: "Excellent",
        },
        {
          letter: "B2",
          minScore: 70,
          maxScore: 74,
          gpa: 4.0,
          remark: "Very Good",
        },
        { letter: "B3", minScore: 65, maxScore: 69, gpa: 3.5, remark: "Good" },
        {
          letter: "C4",
          minScore: 60,
          maxScore: 64,
          gpa: 3.0,
          remark: "Credit",
        },
        {
          letter: "C5",
          minScore: 55,
          maxScore: 59,
          gpa: 2.5,
          remark: "Credit",
        },
        {
          letter: "C6",
          minScore: 50,
          maxScore: 54,
          gpa: 2.0,
          remark: "Credit",
        },
        { letter: "D7", minScore: 45, maxScore: 49, gpa: 1.5, remark: "Pass" },
        { letter: "E8", minScore: 40, maxScore: 44, gpa: 1.0, remark: "Pass" },
        { letter: "F9", minScore: 0, maxScore: 39, gpa: 0.0, remark: "Fail" },
      ],
    },
  ];
};

export default function GradingPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<GradingSystem | null>(
    null,
  );

  const { data: gradingSystems, isLoading } = useQuery({
    queryKey: ["grading-systems"],
    queryFn: fetchGradingSystems,
  });

  const form = useForm<GradingSystemFormData>({
    resolver: zodResolver(gradingSystemSchema),
    defaultValues: {
      name: "",
      grades: [{ letter: "", minScore: 0, maxScore: 100, gpa: 0, remark: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "grades",
  });

  const mutation = useMutation({
    mutationFn: async (data: GradingSystemFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grading-systems"] });
      toast.success(
        editingSystem ? "Grading system updated!" : "Grading system created!",
      );
      setDialogOpen(false);
      setEditingSystem(null);
      form.reset();
    },
  });

  const handleEdit = (system: GradingSystem) => {
    setEditingSystem(system);
    form.reset({
      name: system.name,
      grades: system.grades,
    });
    setDialogOpen(true);
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
                form.reset();
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
                  {editingSystem
                    ? "Edit Grading System"
                    : "Create Grading System"}
                </DialogTitle>
                <DialogDescription>
                  Define the grading logic for assessments.
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 pr-4 -mr-4">
                <Form {...form}>
                  <form
                    id="grading-form"
                    onSubmit={form.handleSubmit((data) =>
                      mutation.mutate(data),
                    )}
                    className="space-y-6 p-1"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Standard WAEC"
                              {...field}
                            />
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
                              letter: "",
                              minScore: 0,
                              maxScore: 0,
                              gpa: 0,
                              remark: "",
                            })
                          }
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Grade
                        </Button>
                      </div>

                      <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="grid grid-cols-12 gap-2 items-start"
                          >
                            <div className="col-span-2">
                              <FormField
                                control={form.control}
                                name={`grades.${index}.letter`}
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
                                        placeholder="Min"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value),
                                          )
                                        }
                                      />
                                    </FormControl>
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
                                        placeholder="Max"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value),
                                          )
                                        }
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="col-span-2">
                              <FormField
                                control={form.control}
                                name={`grades.${index}.gpa`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="GPA"
                                        step="0.1"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value),
                                          )
                                        }
                                      />
                                    </FormControl>
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
                                      <Input placeholder="Remark" {...field} />
                                    </FormControl>
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
                <Button
                  type="submit"
                  form="grading-form"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Saving..."
                    : editingSystem
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {gradingSystems?.map((system) => (
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
                  {system.grades.map((grade) => (
                    <TableRow key={grade.letter}>
                      <TableCell className="font-medium">
                        {grade.letter}
                      </TableCell>
                      <TableCell>
                        {grade.minScore} - {grade.maxScore}
                      </TableCell>
                      <TableCell className="text-right">{grade.gpa}</TableCell>
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
