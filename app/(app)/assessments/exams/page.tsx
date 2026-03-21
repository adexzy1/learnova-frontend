"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Edit, FileText, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import useExaminationsService from "./_service/useExaminationsService"
import type { Examination } from "@/lib/api"

const examSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sessionId: z.string().min(1, "Session is required"),
  termId: z.string().min(1, "Term is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["scheduled", "ongoing", "completed"]),
})

type ExamFormData = z.infer<typeof examSchema>

export default function ExamsPage() {
  const {
    examinations,
    examinationsLoading,
    sessions,
    dialogOpen,
    setDialogOpen,
    editingExam,
    setEditingExam,
    handleEdit,
    createMutation,
    updateMutation,
  } = useExaminationsService()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: ExamFormData) => {
    if (editingExam) {
      updateMutation.mutate(
        { id: editingExam.id, payload: data },
        { onSuccess: () => reset() },
      )
    } else {
      createMutation.mutate(data, { onSuccess: () => reset() })
    }
  }

  const onEditClick = (exam: Examination) => {
    handleEdit(exam)
    setValue("name", exam.name)
    setValue("sessionId", exam.sessionId)
    setValue("termId", exam.termId)
    setValue("startDate", exam.startDate.split("T")[0])
    setValue("endDate", exam.endDate.split("T")[0])
    setValue("status", exam.status)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-amber-100 text-amber-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const examDialog = (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setEditingExam(null)
          reset()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={() => { setEditingExam(null); reset() }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Examination
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingExam ? "Edit Examination" : "Add Examination"}
          </DialogTitle>
          <DialogDescription>
            {editingExam
              ? "Update examination details"
              : "Create a new examination schedule"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Examination Name</Label>
              <Input
                id="name"
                placeholder="e.g., First Term Examination"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionId">Session</Label>
                <Select onValueChange={(v) => setValue("sessionId", v)}>
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
                {errors.sessionId && (
                  <p className="text-sm text-destructive">
                    {errors.sessionId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="termId">Term</Label>
                <Select onValueChange={(v) => setValue("termId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term-1">First Term</SelectItem>
                    <SelectItem value="term-2">Second Term</SelectItem>
                    <SelectItem value="term-3">Third Term</SelectItem>
                  </SelectContent>
                </Select>
                {errors.termId && (
                  <p className="text-sm text-destructive">
                    {errors.termId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-sm text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
                {errors.endDate && (
                  <p className="text-sm text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue="scheduled"
                onValueChange={(v) =>
                  setValue("status", v as ExamFormData["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
              {isPending ? "Saving..." : editingExam ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        description="Manage examination schedules and settings"
        actions={examDialog}
      />

      {examinationsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {examinations.map((exam) => (
            <Card key={exam.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                    <CardDescription>
                      {sessions.find((s) => s.id === exam.sessionId)?.name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(exam.startDate).toLocaleDateString()} -{" "}
                      {new Date(exam.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.ceil(
                        (new Date(exam.endDate).getTime() -
                          new Date(exam.startDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Term: {exam.termId.replace("term-", "")}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => onEditClick(exam)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!examinationsLoading && examinations.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No examinations scheduled</h3>
            <p className="text-muted-foreground mt-1">
              Get started by creating your first examination schedule.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
