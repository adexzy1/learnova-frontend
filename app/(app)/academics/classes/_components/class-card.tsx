"use client";

import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClassLevel } from "@/types";
import { DeleteClassDialog } from "./delete-class-dialog";
import ClassArmCard from "./class-arm";
import { useClassLevel } from "../_hooks/useClassLevel";
import { ClassArmDialog, type ClassArmDialogRef } from "./class-arm-dialog";
import { useRef } from "react";

interface ClassCardProps {
  classLevel: ClassLevel;
  onEdit: (classLevel: ClassLevel) => void;
}

export function ClassCard({ classLevel, onEdit }: ClassCardProps) {
  const armDialogRef = useRef<ClassArmDialogRef>(null);
  const {
    deleteClassOpen,
    setDeleteClassOpen,
    handleDeleteClass,
    confirmDeleteClass,
    isDeleting: isDeletingClass,
  } = useClassLevel();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            {classLevel.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(classLevel)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => armDialogRef.current?.open()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Arm
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClass(classLevel)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {classLevel.classArms.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">No arms yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => armDialogRef.current?.open()}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Arm
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {classLevel.classArms.map((arm) => (
                <ClassArmCard key={arm.id} arm={arm} classId={classLevel.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteClassDialog
        open={deleteClassOpen}
        onOpenChange={setDeleteClassOpen}
        className={classLevel.name}
        onConfirm={confirmDeleteClass}
        isDeleting={isDeletingClass}
      />

      <ClassArmDialog ref={armDialogRef} classLevelId={classLevel.id} />
    </>
  );
}
