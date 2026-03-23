"use client";

import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Clock,
  MapPin,
  Plus,
  Trash2,
  CalendarPlus,
  Copy,
  Printer,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { TERM_ENDPOINTS } from "@/lib/api-routes";
import type { AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PageHeader } from "@/components/shared/page-header";
import useTimetableService from "./_service/useTimetableService";
import type { TimetableEntryFormData } from "./_service/useTimetableService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const entrySchema = z
  .object({
    dayOfWeek: z.string().min(1, "Day is required"),
    periodId: z.coerce.number().min(1, "Period number is required"),
    subjectTeacherId: z.string().min(1, "Subject/Teacher is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    room: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be later than start time",
    path: ["endTime"],
  });

type EntryFormData = z.infer<typeof entrySchema>;

/** Derived period row for the grid — just the period number */
interface PeriodRow {
  periodId: number;
}

export default function TimetablePage() {
  const {
    selectedSession,
    handleSessionChange,
    sessions,
    sessionsLoading,
    selectedTerm,
    handleTermChange,
    terms,
    termsLoading,
    selectedClass,
    handleClassChange,
    classOptions,
    classesLoading,
    subjectTeachers,
    timetableEntries,
    timetableMap,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingEntry,
    cellPrefill,
    handleEdit,
    handleCellClick,
    handleDialogClose,
    createMutation,
    updateMutation,
    deleteMutation,
    copyDialogOpen,
    setCopyDialogOpen,
    copyMutation,
  } = useTimetableService();

  // Derive unique period numbers from actual data, sorted
  const periodRows = useMemo<PeriodRow[]>(() => {
    const seen = new Set<number>();
    for (const entry of timetableEntries) {
      seen.add(entry.periodId);
    }
    return Array.from(seen)
      .sort((a, b) => a - b)
      .map((periodId) => ({ periodId }));
  }, [timetableEntries]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
  });

  // Populate form when editing or prefilling from cell click
  useEffect(() => {
    if (editingEntry) {
      const match = subjectTeachers.find(
        (st) =>
          st.subjectName === editingEntry.subject &&
          st.teacherName === editingEntry.teacher,
      );
      setValue("dayOfWeek", editingEntry.day);
      setValue("periodId", editingEntry.periodId);
      setValue("subjectTeacherId", match?.id ?? "");
      setValue("startTime", editingEntry.startTime);
      setValue("endTime", editingEntry.endTime);
      setValue("room", editingEntry.room ?? "");
    } else if (cellPrefill) {
      reset();
      setValue("dayOfWeek", cellPrefill.dayOfWeek);
      setValue("periodId", cellPrefill.periodId);
    } else {
      reset();
    }
  }, [editingEntry, cellPrefill, subjectTeachers, setValue, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: EntryFormData) => {
    const payload: TimetableEntryFormData = {
      dayOfWeek: data.dayOfWeek,
      periodId: Number(data.periodId),
      subjectTeacherId: data.subjectTeacherId,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room || undefined,
      sessionId: selectedSession,
      termId: selectedTerm,
    };

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const onDialogOpenChange = (open: boolean) => {
    if (!open) handleDialogClose();
    else setDialogOpen(true);
  };

  const selectedLabel =
    classOptions.find((opt) => opt.id === selectedClass)?.name ?? "";
  const selectedSessionLabel =
    sessions.find((s) => s.id === selectedSession)?.name ?? "";
  const selectedTermLabel =
    terms.find((t) => t.id === selectedTerm)?.name ?? "";

  const hasEntries = timetableEntries.length > 0;
  const allSelected = !!selectedSession && !!selectedTerm && !!selectedClass;

  /** Format a time string like "08:00:00" or "08:00" for display */
  const formatTime = (t: string) => t.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable"
        description="View and manage weekly class schedules"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics", href: "/academics" },
          { label: "Timetable" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {allSelected && hasEntries && (
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
            {allSelected && (
              <Button
                onClick={() => {
                  handleDialogClose();
                  setDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            )}
          </div>
        }
      />

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedSession} onValueChange={handleSessionChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent>
            {sessionsLoading ? (
              <SelectItem value="_loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select
          value={selectedTerm}
          onValueChange={handleTermChange}
          disabled={!selectedSession}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            {termsLoading ? (
              <SelectItem value="_loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              terms.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select
          value={selectedClass}
          onValueChange={handleClassChange}
          disabled={!selectedTerm}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classesLoading ? (
              <SelectItem value="_loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              classOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <Card id="printable-timetable">
        {/* Print-only header — hidden on screen */}
        <div className="hidden print:block text-center mb-4 pt-4">
          <h1 className="text-xl font-bold">Class Timetable</h1>
          <p className="text-sm text-muted-foreground">
            {selectedLabel}
            {selectedSessionLabel && ` — ${selectedSessionLabel}`}
            {selectedTermLabel && `, ${selectedTermLabel}`}
          </p>
        </div>
        <CardHeader className="print:hidden">
          <CardTitle>
            Weekly Schedule{selectedLabel ? ` - ${selectedLabel}` : ""}
          </CardTitle>
          <CardDescription>
            {!allSelected
              ? "Select a session, term, and class to view the timetable"
              : hasEntries
                ? "Click an entry to edit it, or use Add Entry to create new slots"
                : "No entries yet — add entries or copy from a previous term"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!allSelected ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Please select a session, term, and class to view the timetable.
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Loading timetable...
            </div>
          ) : !hasEntries ? (
            /* Empty state — no entries for this term */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No timetable entries</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                This class doesn&apos;t have a timetable for this term yet. You
                can start from scratch or copy from a previous term.
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCopyDialogOpen(true)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy from Previous Term
                </Button>
                <Button
                  onClick={() => {
                    handleDialogClose();
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Entry
                </Button>
              </div>
            </div>
          ) : (
            /* Dynamic grid built from actual data */
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium w-28 border-r">
                      Period
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="px-4 py-3 font-medium border-l min-w-[160px]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {periodRows.map((period) => (
                    <tr
                      key={period.periodId}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 border-r bg-muted/20">
                        <div className="font-semibold">
                          Period {period.periodId}
                        </div>
                      </td>
                      {DAYS.map((day) => {
                        const entry = timetableMap[day]?.[period.periodId];

                        return (
                          <td key={day} className="p-2 border-l relative group">
                            {entry ? (
                              <div
                                onClick={() => handleEdit(entry)}
                                className="flex flex-col gap-1 p-2 rounded-md bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                              >
                                <span className="font-semibold text-primary">
                                  {entry.subject}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatTime(entry.startTime)} –{" "}
                                    {formatTime(entry.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>{entry.teacher}</span>
                                </div>
                                {entry.room && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{entry.room}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  handleCellClick({
                                    dayOfWeek: day,
                                    periodId: period.periodId,
                                  })
                                }
                                className="h-16 w-full flex items-center justify-center rounded-md border-2 border-dashed border-transparent hover:border-muted-foreground/20 text-muted-foreground/0 hover:text-muted-foreground/50 transition-all cursor-pointer"
                              >
                                <Plus className="h-4 w-4" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Timetable Entry" : "Add Timetable Entry"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry
                ? "Update the subject, teacher, or room for this slot"
                : "Define the day, period, time, and assign a subject/teacher"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Day + Period number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day</Label>
                  <Select
                    value={watch("dayOfWeek") ?? ""}
                    onValueChange={(v) => setValue("dayOfWeek", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dayOfWeek && (
                    <p className="text-sm text-destructive">
                      {errors.dayOfWeek.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodId">Period Number</Label>
                  <Input
                    id="periodId"
                    type="number"
                    min={1}
                    placeholder="e.g., 1"
                    {...register("periodId")}
                  />
                  {errors.periodId && (
                    <p className="text-sm text-destructive">
                      {errors.periodId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Start / End time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <TimePicker
                    value={watch("startTime")}
                    onChange={(v) => setValue("startTime", v)}
                  />
                  {errors.startTime && (
                    <p className="text-sm text-destructive">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <TimePicker
                    value={watch("endTime")}
                    onChange={(v) => setValue("endTime", v)}
                  />
                  {errors.endTime && (
                    <p className="text-sm text-destructive">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject/Teacher */}
              <div className="space-y-2">
                <Label htmlFor="subjectTeacherId">Subject / Teacher</Label>
                {subjectTeachers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No subject-teacher assignments found for this class. Please
                    assign subjects to teachers first.
                  </p>
                ) : (
                  <Select
                    value={watch("subjectTeacherId") ?? ""}
                    onValueChange={(v) => setValue("subjectTeacherId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject / teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectTeachers.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.subjectName} — {st.teacherName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.subjectTeacherId && (
                  <p className="text-sm text-destructive">
                    {errors.subjectTeacherId.message}
                  </p>
                )}
              </div>

              {/* Room */}
              <div className="space-y-2">
                <Label htmlFor="room">Room (optional)</Label>
                <Input
                  id="room"
                  placeholder="e.g., Room 101"
                  {...register("room")}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              {editingEntry && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(editingEntry.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : editingEntry
                    ? "Update"
                    : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Copy from Previous Term Dialog */}
      <CopyTimetableDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        sessions={sessions}
        currentSessionId={selectedSession}
        currentTermId={selectedTerm}
        classId={selectedClass}
        copyMutation={copyMutation}
      />
    </div>
  );
}

// ── Copy Timetable Dialog ─────────────────────────────────────────────

interface CopyTimetableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: { id: string; name: string }[];
  currentSessionId: string;
  currentTermId: string;
  classId: string;
  copyMutation: ReturnType<
    typeof useTimetableService
  >["copyMutation"];
}

function CopyTimetableDialog({
  open,
  onOpenChange,
  sessions,
  currentSessionId,
  currentTermId,
  classId,
  copyMutation,
}: CopyTimetableDialogProps) {
  const [sourceSession, setSourceSession] = useState("");
  const [sourceTerm, setSourceTerm] = useState("");

  // Fetch terms for the selected source session
  const { data: sourceTermsResponse } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: ["copy-source-terms", sourceSession],
    queryFn: () =>
      apiClient.get(TERM_ENDPOINTS.GET_SELECTABLE_TERMS, {
        params: { sessionId: sourceSession },
      }),
    enabled: !!sourceSession,
  });

  const sourceTerms = useMemo(
    () => sourceTermsResponse?.data?.data ?? [],
    [sourceTermsResponse],
  );

  const handleCopy = () => {
    if (!sourceTerm) return;
    copyMutation.mutate({
      sourceTermId: sourceTerm,
      targetTermId: currentTermId,
      targetSessionId: currentSessionId,
      classId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Copy Timetable from Previous Term</DialogTitle>
          <DialogDescription>
            Select the session and term to copy the timetable from. All entries
            will be duplicated into the current term.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Source Session</Label>
            <Select
              value={sourceSession}
              onValueChange={(v) => {
                setSourceSession(v);
                setSourceTerm("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source Term</Label>
            <Select
              value={sourceTerm}
              onValueChange={setSourceTerm}
              disabled={!sourceSession}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {sourceTerms.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!sourceTerm || copyMutation.isPending}
          >
            {copyMutation.isPending ? "Copying..." : "Copy Timetable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
