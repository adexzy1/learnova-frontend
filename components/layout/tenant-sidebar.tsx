"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useTenant } from "@/providers/tenant-provider";
import { useAuth } from "@/providers/tenant-auth-provider";
import {
  tenantNavigation,
  parentNavigation,
  studentNavigation,
  type NavItem,
  type NavSection,
  superAdminNavigation,
} from "@/lib/navigation";
import { PERMISSIONS } from "@/app/constants/permissions";

type AccessControl = {
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
};

function canAccessItem(item: NavItem, access: AccessControl) {
  if (access.isSuperAdmin) return true;
  if (!item.permission) return true;
  return Array.isArray(item.permission)
    ? access.hasAnyPermission(item.permission)
    : access.hasPermission(item.permission);
}

function isItemVisible(item: NavItem, access: AccessControl): boolean {
  if (!canAccessItem(item, access)) return false;
  if (!item.children || item.children.length === 0) return true;
  return item.children.some((child) => isItemVisible(child, access));
}

function NavItemComponent({
  item,
  isCollapsed,
}: {
  item: NavItem;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const { user, hasPermission, hasAnyPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Check permissions - if permission is not specified, assume allowed
  const hasAccess = item.permission
    ? Array.isArray(item.permission)
      ? hasAnyPermission(item.permission)
      : hasPermission(item.permission)
    : true;

  // For super admin, bypass permission checks
  const finalAccess = user?.role === "super-admin" ? true : hasAccess;

  if (!finalAccess) return null;

  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  // If has children, render collapsible
  if (item.children && item.children.length > 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between font-normal",
              isActive && "bg-accent text-accent-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {!isCollapsed && item.title}
            </span>
            {!isCollapsed && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 space-y-1">
          {item.children.map((child) => (
            <NavItemComponent
              key={child.href}
              item={child}
              isCollapsed={isCollapsed}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start font-normal",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      <Link href={item.href}>
        <Icon className="h-4 w-4 mr-2" />
        {!isCollapsed && item.title}
        {item.badge && item.badge > 0 && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    </Button>
  );
}

function NavSectionComponent({
  section,
  isCollapsed,
}: {
  section: NavSection;
  isCollapsed?: boolean;
}) {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <h4 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h4>
      )}
      {section.items.map((item) => (
        <NavItemComponent
          key={item.href}
          item={item}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
}

interface TenantSidebarProps {
  isCollapsed?: boolean;
  navigation?: NavSection[];
  tenantName?: string;
  userName?: string;
}

export function TenantSidebar({
  isCollapsed = false,
  navigation: propNavigation,
  tenantName: propTenantName,
  userName: propUserName,
}: TenantSidebarProps) {
  const { tenant } = useTenant();
  const { user, hasPermission, hasAnyPermission } = useAuth();

  // Determine which navigation to use
  let navigation: NavSection[];

  if (hasPermission(PERMISSIONS.PORTAL_GUARDIAN)) {
    navigation = parentNavigation;
  } else if (hasPermission(PERMISSIONS.PORTAL_STUDENT)) {
    navigation = studentNavigation;
  } else if (
    hasAnyPermission([PERMISSIONS.PORTAL_STAFF, PERMISSIONS.PORTAL_ADMIN])
  ) {
    navigation = tenantNavigation;
  } else if (user?.isSystem) {
    navigation = superAdminNavigation;
  } else {
    navigation = [];
  }

  const access: AccessControl = {
    isSuperAdmin: user?.isSystem ?? false,
    hasPermission,
    hasAnyPermission,
  };

  const visibleNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isItemVisible(item, access)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b",
          isCollapsed ? "justify-center" : "gap-2",
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-4 w-4" />
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-sm truncate">
            {user?.isSystem ? "Super Admin" : user?.tenantUsers[0].tenant.name}
          </span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-4">
          {visibleNavigation.map((section) => (
            <NavSectionComponent
              key={section.title}
              section={section}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
