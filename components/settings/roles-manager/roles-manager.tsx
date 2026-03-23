import { PERMISSIONS } from "@/app/constants/permissions";
import DeleteModal from "./delete-modal";
import CreateModal from "./create-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAllRoles } from "./service/role-manager.service";
import { Role } from "./types";
import EditModal from "./edit-modal";

const allPermissions = Object.values(PERMISSIONS) as string[];

export default function RolesManager() {
  const { roles, isLoading, isError, error } = useAllRoles();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-sm">Error: {error?.message}</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Manage user roles and access control levels.
            </CardDescription>
          </div>
          <CreateModal allPermissions={allPermissions} />
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-5 p-4 font-medium border-b bg-muted/50">
              <div className="col-span-1">Role Name</div>
              <div className="col-span-2">Description</div>
              <div className="col-span-1 text-right">Users</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {roles?.map((role: Role) => (
              <div
                key={role.id}
                className="grid grid-cols-5 p-4 border-b last:border-0 items-center"
              >
                <div className="col-span-1 font-medium">{role.name}</div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {role.description}
                </div>
                <div className="col-span-1 text-right text-sm flex items-center justify-end gap-3">
                  <div className="text-sm mr-4">{role.users ?? 0} users</div>
                </div>
                <div className="col-span-1 flex justify-end items-center">
                  <EditModal role={role} allPermissions={allPermissions} />
                  <DeleteModal role={role} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
