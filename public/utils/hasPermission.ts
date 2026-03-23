export function hasPermission(
  permissions: string[],
  permission: string,
): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: string[],
  permission: string,
): boolean {
  return permissions.some((permission) => permissions.includes(permission));
}

export function hasAllPermissions(
  permissions: string[],
  permission: string,
): boolean {
  return permissions.every((permission) => permissions.includes(permission));
}
