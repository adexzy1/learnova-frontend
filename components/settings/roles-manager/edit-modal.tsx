import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateRole } from "./service/role-manager.service";
import { Loader2, SquarePen } from "lucide-react";
import PermissionSelector from "./permission-selector";

interface Props {
  role: {
    id: string;
    name: string;
    description?: string;
    permissions?: string[];
  };
  allPermissions: string[];
}

const editRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

const EditModal: FC<Props> = ({ role, allPermissions }: Props) => {
  const [open, setOpen] = useState(false);

  const permissions = role.permissions;

  const form = useForm<z.infer<typeof editRoleSchema>>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      name: role.name,
      description: role.description || "",
      permissions: permissions,
    },
  });

  const { updateRole, isPending } = useUpdateRole(role.id);

  // Reset form when role changes or modal opens to avoid stale data
  // useEffect(() => {
  //   if (open) {
  //     const perms = role.permissions?.map((p: any) => p.permission) || [];
  //     form.reset({
  //       name: role.name,
  //       description: role.description || "",
  //       permissions: perms,
  //     });
  //   }
  // }, [role, open, form]);

  const onSubmit = async (data: z.infer<typeof editRoleSchema>) => {
    try {
      await updateRole(data);
      setOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <SquarePen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Edit role details and permissions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="permissions"
              control={form.control}
              render={({ field }) => (
                <PermissionSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  allPermissions={allPermissions}
                />
              )}
            />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
