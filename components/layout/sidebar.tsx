'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { 
  CalendarDays, 
  LayoutDashboard, 
  Calendar, 
  CalendarPlus, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Eventos', href: '/dashboard/events', icon: CalendarPlus },
]

const adminNavigation = [
  { name: 'Usuarios', href: '/dashboard/users', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const allNavigation = isAdmin 
    ? [...navigation, ...adminNavigation] 
    : navigation

  const NavContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 px-4 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <CalendarDays className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">CALENDARIOBACK</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {allNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-foreground">{user?.nombre}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <span className={cn(
            'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            user?.rol === 'ADMIN' 
              ? 'bg-primary/20 text-primary' 
              : 'bg-muted text-muted-foreground'
          )}>
            {user?.rol}
          </span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-card border-r border-border transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border">
        <NavContent />
      </aside>
    </>
  )
}
