"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import axiosClient from "@/lib/axios-client";
import { CLASS_ENDPOINTS, SUBJECT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { SubjectTeacherAssignment } from "@/types";

interface SubjectAssignmentsProps {
  staffId: string;
}

export function SubjectAssignments({ staffId }: SubjectAssignmentsProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [classArmId, setClassArmId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // Fetch assignments for this staff member
  const { data: assignmentsRes, isLoading } = useQuery<
    AxiosResponse<{ data: SubjectTeacherAssignment[] }>
  >({
    queryKey: [queryKeys.SUBJECT_TEACHERS, staffId],
    queryFn: () =>
      axiosClient.get(
        CLASS_ENDPOINTS.GET_SUBJECT_TEACHERS_BY_STAFF.replace(
          ":staffId",
          staffId
        )
      ),
  });

  const assignments = assignmentsRes?.data?.data || [];

  // Fetch class arms for dropdown
  const { data: classArmsRes } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.CLASS_ARMS],
    queryFn: () => axiosClient.get(CLASS_ENDPOINTS.GET_ALL_CLASS_ARMS),
  });

  const classArms = classArmsRes?.data?.data || [];

  // Fetch subjects for dropdown
  const { data: subjectsRes } = useQuery<
    AxiosResponse<{ data: { id: string; name: string }[] }>
  >({
    queryKey: [queryKeys.SELECTABLE_SUBJECTS],
    queryFn: () => axiosClient.get(SUBJECT_ENDPOINTS.GET_SELECTABLE_SUBJECTS),
  });

  const subjects = subjectsRes?.data?.data || [];

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (data: {
      classArmId: string;
      subjectId: string;
      staffId: string;
    }) => axiosClient.post(CLASS_ENDPOINTS.ASSIGN_SUBJECT_TEACHER, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.SUBJECT_TEACHERS, staffId],
      });
      toast.success(res.data.message);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign");
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      axiosClient.delete(
        CLASS_ENDPOINTS.REMOVE_SUBJECT_TEACHER.replace(":id", id)
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.SUBJECT_TEACHERS, staffId],
      });
      toast.success(res.data.message);
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove assignment");
      setDeleteId(null);
    },
  });

  const resetForm = () => {
    setClassArmId("");
    setSubjectId("");
    setDialogOpen(false);
  };

  const handleAssign = () => {
    if (!classArmId || !subjectId) {
      toast.error("Please select both a class and a subject");
      return;
    }
    assignMutation.mutate({ classArmId, subjectId, staffId });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class & Subject Assignments
            </CardTitle>
            <CardDescription>
              Subjects and classes this staff member teaches
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Class & Subject</DialogTitle>
                <DialogDescription>
                  Select a class and subject to assign to this teacher.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Select value={classArmId} onValueChange={setClassArmId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classArms.map((arm) => (
                        <SelectItem key={arm.id} value={arm.id}>
                          {arm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={assignMutation.isPending}
                >
                  {assignMutation.isPending ? "Assigning..." : "Assign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No class-subject assignments yet.</p>
              <p className="text-sm">
                Click &quot;Assign&quot; to add a class and subject.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {a.classArm?.class?.name} {a.classArm?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.subject?.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(a.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this class-subject assignment?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && removeMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
