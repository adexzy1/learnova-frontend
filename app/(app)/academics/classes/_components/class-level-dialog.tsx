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
import { Button } from "@/components/ui/button";
import { useClassLevel } from "../_hooks/useClassLevel";
import { useEffect } from "react";
import { ClassLevel } from "@/types";

interface ClassLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClass: ClassLevel | null;
}

export function ClassLevelDialog({
  open,
  onOpenChange,
  editingClass,
}: ClassLevelDialogProps) {
  const { form, saveClassMutation, setClassDialogOpen } = useClassLevel();

  // Handle form reset when editing/creating
  useEffect(() => {
    if (open) {
      if (editingClass) {
        form.reset({
          name: editingClass.name,
          level: editingClass.level,
          description: editingClass.description || "",
        });
      } else {
        form.reset({
          name: "",
          level: "",
          description: "",
        });
      }
    }
  }, [open, editingClass, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingClass ? "Edit Class Level" : "Create Class Level"}
          </DialogTitle>
          <DialogDescription>
            {editingClass
              ? "Update the class level details."
              : "Add a new class level to the school structure."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              saveClassMutation.mutate(data),
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="JSS 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
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
              <Button type="submit" disabled={saveClassMutation.isPending}>
                {saveClassMutation.isPending
                  ? "Saving..."
                  : editingClass
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
