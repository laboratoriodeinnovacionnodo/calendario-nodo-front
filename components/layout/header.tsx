'use client'

import React from "react"

import { useAuth } from '@/lib/auth-context'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="ml-12 md:ml-0">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {action}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
