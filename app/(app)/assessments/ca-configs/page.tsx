"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Settings2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import useCAConfigService from "./_service/useCAConfigService";

const caConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  maxScore: z.coerce
    .number()
    .int()
    .min(1, "Must be at least 1")
    .max(100, "Cannot exceed 100"),
  weight: z.coerce.number().min(0).max(100).optional(),
});

type CAConfigFormData = z.infer<typeof caConfigSchema>;

export default function CAConfigsPage() {
  const {
    selectedSession,
    handleSessionChange,
    selectedTerm,
    setSelectedTerm,
    sessions,
    terms,
    configs,
    configsLoading,
    totalMaxScore,
    dialogOpen,
    setDialogOpen,
    editingConfig,
    setEditingConfig,
    handleEdit,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleLockMutation,
  } = useCAConfigService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CAConfigFormData>({
    resolver: zodResolver(caConfigSchema),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CAConfigFormData) => {
    if (editingConfig) {
      updateMutation.mutate(
        { id: editingConfig.id, payload: data },
        { onSuccess: () => reset() },
      );
    } else {
      createMutation.mutate(
        { ...data, termId: selectedTerm },
        { onSuccess: () => reset() },
      );
    }
  };

  const onEditClick = (config: (typeof configs)[number]) => {
    handleEdit(config);
    reset({
      name: config.name,
      maxScore: config.maxScore,
      weight: config.weight,
    });
  };

  const configDialog = (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingConfig(null);
          reset({ name: "", maxScore: 20, weight: 0 });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={!selectedTerm}
          onClick={() => {
            setEditingConfig(null);
            reset({ name: "", maxScore: 20, weight: 0 });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add CA Config
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {editingConfig ? "Edit CA Configuration" : "Add CA Configuration"}
          </DialogTitle>
          <DialogDescription>
            {editingConfig
              ? "Update the CA configuration details"
              : "Create a new continuous assessment configuration for the selected term"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder='e.g., "CA 1", "Assignment", "Test"'
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxScore">Max Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min={1}
                  max={100}
                  placeholder="e.g., 20"
                  {...register("maxScore")}
                />
                {errors.maxScore && (
                  <p className="text-sm text-destructive">
                    {errors.maxScore.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g., 40"
                  {...register("weight")}
                />
                {errors.weight && (
                  <p className="text-sm text-destructive">
                    {errors.weight.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : editingConfig ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="CA Configurations"
        description="Set up continuous assessment components for each term"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/assessments" },
          { label: "CA Configs" },
        ]}
        actions={configDialog}
      />

      {/* Session & Term Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Session & Term</CardTitle>
          <CardDescription>
            Choose a session and term to view and manage its CA configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 max-w-lg">
            <Select value={selectedSession} onValueChange={handleSessionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedTerm}
              onValueChange={setSelectedTerm}
              disabled={!selectedSession}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedSession ? "Select term" : "Select a session first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configs Table */}
      {selectedTerm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">CA Components</CardTitle>
                <CardDescription>
                  {configs.length > 0
                    ? `${configs.length} component${configs.length > 1 ? "s" : ""} configured — Total max score: ${totalMaxScore}`
                    : "No CA components configured for this term"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {configsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : configs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <Settings2 className="h-8 w-8" />
                <p>No CA configurations yet</p>
                <p className="text-sm">
                  Click &quot;Add CA Config&quot; to create the first component
                  (e.g., CA 1, CA 2)
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S/N</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-28">Max Score</TableHead>
                    <TableHead className="w-28">Weight (%)</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-40 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config, index) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {config.name}
                      </TableCell>
                      <TableCell>{config.maxScore}</TableCell>
                      <TableCell>{config.weight ?? 0}%</TableCell>
                      <TableCell>
                        {config.isLocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Unlock className="h-3 w-3" />
                            Open
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              config.isLocked ? "Unlock scores" : "Lock scores"
                            }
                            onClick={() =>
                              toggleLockMutation.mutate({
                                id: config.id,
                                isLocked: !config.isLocked,
                              })
                            }
                          >
                            {config.isLocked ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditClick(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedTerm && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {!selectedSession ? "Select a session" : "Select a term"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {!selectedSession
                ? "Choose a session and term above to view or create CA configurations"
                : "Choose a term to view or create CA configurations"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
