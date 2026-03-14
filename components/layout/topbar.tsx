"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  GraduationCap,
  Wifi,
  WifiOff,
  Check,
  RefreshCw,
  Shield,
  Users,
  BookOpen,
  UserCog,
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

import { useTenant } from "@/providers/tenant-provider";
// import { useAuth } from "@/providers/auth-provider";
import { useOffline } from "@/hooks/use-offline";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/providers/app-auth-provider";

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
  // const { tenant, isSuperAdmin } = useTenant()
  // const { user, logout } = useAuth()
  const { isOnline, unsyncedCount } = useOffline();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                2
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
              <span className="font-medium">Term Results Published</span>
              <span className="text-xs text-muted-foreground">
                First term results for 2024/2025 session have been published.
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
              <span className="font-medium">Payment Reminder</span>
              <span className="text-xs text-muted-foreground">
                School fees payment deadline is approaching.
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/notifications"
                className="w-full text-center justify-center"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
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
