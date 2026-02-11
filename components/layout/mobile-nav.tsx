'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, GraduationCap } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { useTenant } from '@/providers/tenant-provider'
import { useAuth } from '@/providers/tenant-auth-provider'
import { 
  tenantNavigation, 
  parentNavigation, 
  studentNavigation,
  superAdminNavigation,
  type NavItem, 
  type NavSection 
} from '@/lib/navigation'

interface MobileNavProps {
  onNavigate?: () => void
}

type AccessControl = {
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

function canAccessItem(item: NavItem, access: AccessControl) {
  if (!item.permission) return true
  return Array.isArray(item.permission)
    ? access.hasAnyPermission(item.permission)
    : access.hasPermission(item.permission)
}

function isItemVisible(item: NavItem, access: AccessControl): boolean {
  if (!canAccessItem(item, access)) return false
  if (!item.children || item.children.length === 0) return true
  return item.children.some((child) => isItemVisible(child, access))
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname()
  const { hasPermission, hasAnyPermission } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Check permissions
  const hasAccess = item.permission
    ? Array.isArray(item.permission)
      ? hasAnyPermission(item.permission)
      : hasPermission(item.permission)
    : true

  if (!hasAccess) return null

  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const Icon = item.icon

  // If has children, render collapsible
  if (item.children && item.children.length > 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-between font-normal h-11',
              isActive && 'bg-accent text-accent-foreground'
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              {item.title}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-8 space-y-1">
          {item.children.map((child) => (
            <MobileNavItem key={child.href} item={child} onNavigate={onNavigate} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        'w-full justify-start font-normal h-11',
        isActive && 'bg-accent text-accent-foreground'
      )}
      onClick={onNavigate}
    >
      <Link href={item.href}>
        <Icon className="h-5 w-5 mr-3" />
        {item.title}
        {item.badge && item.badge > 0 && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    </Button>
  )
}

function MobileNavSection({ section, onNavigate }: { section: NavSection; onNavigate?: () => void }) {
  return (
    <div className="space-y-1">
      <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {section.title}
      </h4>
      {section.items.map((item) => (
        <MobileNavItem key={item.href} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  )
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  const { tenant, isSuperAdmin } = useTenant()
  const { user, hasPermission, hasAnyPermission } = useAuth()

  // Determine which navigation to use based on user role and domain
  let navigation: NavSection[]
  if (isSuperAdmin) {
    navigation = superAdminNavigation
  } else if (user?.role === 'parent') {
    navigation = parentNavigation
  } else if (user?.role === 'student') {
    navigation = studentNavigation
  } else {
    navigation = tenantNavigation
  }

  const access: AccessControl = {
    hasPermission,
    hasAnyPermission,
  }

  const visibleNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isItemVisible(item, access)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-semibold truncate">
          {isSuperAdmin ? 'Super Admin' : tenant.schoolName}
        </span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-4">
          {visibleNavigation.map((section) => (
            <MobileNavSection 
              key={section.title} 
              section={section}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}
