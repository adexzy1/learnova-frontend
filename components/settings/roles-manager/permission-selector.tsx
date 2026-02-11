import React, { FC, useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormLabel, FormItem, FormMessage } from "@/components/ui/form";

interface PermissionSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  allPermissions: string[];
}

const PermissionSelector: FC<PermissionSelectorProps> = ({
  value,
  onChange,
  allPermissions,
}) => {
  const [search, setSearch] = useState("");

  // Group permissions
  const groups = useMemo(() => {
    return allPermissions.reduce(
      (acc, p) => {
        const [group] = p.split(".");
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }, [allPermissions]);

  const filteredGroups = useMemo(() => {
    return Object.entries(groups)
      .map(([name, perms]) => ({
        name,
        perms: perms.filter((p) =>
          p.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((g) => g.perms.length > 0);
  }, [groups, search]);

  const togglePermission = (p: string, checked: boolean) => {
    const current = new Set(value || []);
    const [group] = p.split(".");
    const managePerm = `${group}.manage`;
    const hasManage = allPermissions.includes(managePerm);

    if (checked) {
      current.add(p);
      if (hasManage) current.add(managePerm);
    } else {
      current.delete(p);
      // If no other permissions in this group (except manage) are checked, remove manage
      const groupPerms = groups[group].filter((gp) => gp !== managePerm);
      const anyRemaining = groupPerms.some((gp) => current.has(gp));
      if (!anyRemaining && hasManage) {
        current.delete(managePerm);
      }
    }
    onChange(Array.from(current));
  };

  const toggleGroup = (groupName: string, checked: boolean) => {
    const current = new Set(value || []);
    const groupPerms = groups[groupName];

    if (checked) {
      groupPerms.forEach((p) => current.add(p));
    } else {
      groupPerms.forEach((p) => current.delete(p));
    }
    onChange(Array.from(current));
  };

  return (
    <FormItem className="space-y-3">
      <FormLabel>Permissions</FormLabel>
      <Input
        placeholder="Search permissions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
      />
      <div className="max-h-80 overflow-y-auto border rounded-md p-4 space-y-6">
        {filteredGroups.map((group) => {
          const groupPerms = groups[group.name];
          const allChecked = groupPerms.every((p) => value?.includes(p));
          const someChecked = groupPerms.some((p) => value?.includes(p));

          return (
            <div key={group.name} className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {group.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Check All
                  </span>
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={(checked) =>
                      toggleGroup(group.name, !!checked)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.perms.map((p) => {
                  const isManage = p.endsWith(".manage");
                  const subPerms = groups[group.name].filter(
                    (gp) => !gp.endsWith(".manage"),
                  );
                  const groupHasSubPermsChecked = subPerms.some((gp) =>
                    value?.includes(gp),
                  );

                  return (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={value?.includes(p)}
                        disabled={isManage && groupHasSubPermsChecked}
                        onCheckedChange={(checked) =>
                          togglePermission(p, !!checked)
                        }
                      />
                      <span className={isManage ? "font-semibold" : "truncate"}>
                        {p.split(".").slice(1).join(".") || p}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default PermissionSelector;
