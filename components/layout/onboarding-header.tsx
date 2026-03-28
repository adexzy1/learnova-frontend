"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap, User, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/app-auth-provider";
import axiosClient from "@/lib/axios-client";
import { useTenant } from "@/providers/tenant-provider";

export function OnboardingHeader() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
      router.push("/");
      router.refresh();
    } catch (error) {
      // Even if it fails, we should probably redirect
      router.push("/");
      router.refresh();
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const schoolName = user?.isSystem ? "Super Admin" : tenant?.schoolName;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-4 w-4" />
        </div>
        <span className="font-semibold text-lg truncate max-w-[200px]">
          {schoolName}
        </span>
      </div>

      <div className="flex-1" />

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
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {user?.role?.replace("-", " ")}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
  );
}
