"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  GraduationCap,
  Wifi,
  WifiOff,
  Check,
  CheckCheck,
  RefreshCw,
  Shield,
  Users,
  BookOpen,
  UserCog,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { formatDistanceToNow } from "date-fns";
import { useTenant } from "@/providers/tenant-provider";
import { useOffline } from "@/hooks/use-offline";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/providers/app-auth-provider";
import useNotificationsService from "@/app/(app)/notifications/_service/useNotificationsService";
import type { Notification } from "@/types";
import { Separator } from "@/components/ui/separator";

const NOTIF_TYPE_CONFIG: Record<
  Notification["type"],
  { icon: typeof Info; bg: string; fg: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-100 dark:bg-blue-950",
    fg: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-100 dark:bg-amber-950",
    fg: "text-amber-600 dark:text-amber-400",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-100 dark:bg-emerald-950",
    fg: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-100 dark:bg-red-950",
    fg: "text-red-600 dark:text-red-400",
  },
};

const PERSONA_META: Record<
  string,
  { label: string; icon: typeof Shield; color: string }
> = {
  ADMIN: {
    label: "Admin",
    icon: Shield,
    color: "text-blue-600 dark:text-blue-400",
  },
  GUARDIAN: {
    label: "Guardian",
    icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  STUDENT: {
    label: "Student",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400",
  },
  STAFF: {
    label: "Staff",
    icon: UserCog,
    color: "text-purple-600 dark:text-purple-400",
  },
  SYSTEM: {
    label: "System",
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
  },
};

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, personas, activePersona, switchPersona, isSwitchingPersona } =
    useAuth();
  const router = useRouter();
  const { tenant } = useTenant();
  const { isOnline, unsyncedCount } = useOffline();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    notifications,
    unreadCount: notifUnreadCount,
    markReadMutation,
    markAllReadMutation,
  } = useNotificationsService();

  const handleLogout = async () => {
    router.push("/");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const hasMultiplePersonas = (personas?.length ?? 0) > 1;

  const handleSwitchPersona = async (persona: string) => {
    if (persona === activePersona) return;
    try {
      await switchPersona(persona);
    } catch (error) {
      console.error("Failed to switch persona:", error);
    }
  };

  return (
    <>
      {/* Full-screen loading overlay during persona switch */}
      {isSwitchingPersona && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Switching persona…
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
        {/* Mobile menu trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <MobileNav onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden lg:flex"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm truncate max-w-[150px]">
            {user?.isSystem ? "Super Admin" : user?.activePersona}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Active Persona Badge (when user has multiple) */}
        {hasMultiplePersonas && activePersona && (
          <Badge variant="outline" className="gap-1.5 hidden sm:flex">
            {(() => {
              const meta = PERSONA_META[activePersona];
              const Icon = meta?.icon ?? Shield;
              return (
                <>
                  <Icon className={`h-3 w-3 ${meta?.color ?? ""}`} />
                  <span className="text-xs">
                    {meta?.label ?? activePersona}
                  </span>
                </>
              );
            })()}
          </Badge>
        )}

        {/* Offline indicator */}
        {!isOnline && (
          <Badge variant="secondary" className="gap-1">
            <WifiOff className="h-3 w-3" />
            Offline
          </Badge>
        )}

        {/* Unsynced drafts indicator */}
        {isOnline && unsyncedCount > 0 && (
          <Badge variant="outline" className="gap-1">
            <Wifi className="h-3 w-3" />
            {unsyncedCount} pending
          </Badge>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {notifUnreadCount > 9 ? "9+" : notifUnreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px] p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Notifications</span>
                {notifUnreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 px-1.5 text-[10px] leading-none"
                  >
                    {notifUnreadCount}
                  </Badge>
                )}
              </div>
              {notifUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
            <Separator />

            {/* Notification items */}
            <div className="max-h-[340px] overflow-y-auto">
              {notifications
                .filter((n) => !n.isRead)
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .slice(0, 5)
                .map((n) => {
                  const config = NOTIF_TYPE_CONFIG[n.type];
                  const NIcon = config.icon;
                  const item = (
                    <div
                      key={n.id}
                      className="group relative flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (!n.isRead) markReadMutation.mutate(n.id);
                        if (n.link) router.push(n.link);
                      }}
                    >
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                      >
                        <NIcon className={`h-3.5 w-3.5 ${config.fg}`} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {n.message}
                        </p>
                        <span className="text-[11px] text-muted-foreground/60 mt-1 block">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                  return <div key={n.id}>{item}</div>;
                })}

              {notifUnreadCount === 0 && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No new notifications
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <Separator />
            <div className="p-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs font-medium text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.avatar || "/placeholder.svg"}
                  alt={user?.firstName}
                />
                <AvatarFallback>
                  {user ? getInitials(user.firstName, user.lastName) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {activePersona
                    ? (PERSONA_META[activePersona]?.label ?? activePersona)
                    : user?.role?.replace("-", " ")}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            {/* Persona Switcher */}
            {hasMultiplePersonas && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Switch Persona
                </DropdownMenuLabel>
                {personas?.map((persona) => {
                  const meta = PERSONA_META[persona];
                  const Icon = meta?.icon ?? Shield;
                  const isActive = persona === activePersona;
                  return (
                    <DropdownMenuItem
                      key={persona}
                      onClick={() => handleSwitchPersona(persona)}
                      className={`cursor-pointer gap-2 ${
                        isActive ? "bg-accent" : ""
                      }`}
                      disabled={isSwitchingPersona}
                    >
                      <Icon className={`h-4 w-4 ${meta?.color ?? ""}`} />
                      <span className="flex-1">{meta?.label ?? persona}</span>
                      {isActive && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </>
  );
}
