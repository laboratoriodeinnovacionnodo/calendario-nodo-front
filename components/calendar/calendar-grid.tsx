'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Event } from '@/types'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { EVENT_TYPE_COLORS } from '@/lib/constants'

interface CalendarGridProps {
  year: number
  month: number
  events: Event[]
  onDateDoubleClick?: (date: Date) => void
  isAdmin?: boolean
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Light background variants for events in calendar
const eventTypeBgLight: Record<string, string> = {
  PENDIENTE: 'bg-amber-50 border-l-2 border-l-amber-500 hover:bg-amber-100',
  EN_CURSO: 'bg-blue-50 border-l-2 border-l-blue-500 hover:bg-blue-100',
  FINALIZADO: 'bg-emerald-50 border-l-2 border-l-emerald-500 hover:bg-emerald-100',
  MASIVO: 'bg-rose-50 border-l-2 border-l-rose-500 hover:bg-rose-100',
  CANCELADO: 'bg-gray-50 border-l-2 border-l-gray-500 hover:bg-gray-100',
  ESCOLAR: 'bg-pink-50 border-l-2 border-l-pink-500 hover:bg-pink-100',
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

export function CalendarGrid({ year, month, events, onDateDoubleClick, isAdmin }: CalendarGridProps) {
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days: { date: number; events: Event[]; isCurrentMonth: boolean }[] = []

    // Previous month days
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        events: [],
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEvents = events.filter((event) => {
        const eventStart = event.fechaDesde.split('T')[0]
        const eventEnd = event.fechaHasta.split('T')[0]
        return dateStr >= eventStart && dateStr <= eventEnd
      })
      
      days.push({
        date: day,
        events: dayEvents,
        isCurrentMonth: true,
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        events: [],
        isCurrentMonth: false,
      })
    }

    return days
  }, [year, month, events])

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day

  const handleDoubleClick = (day: number, isCurrentMonth: boolean) => {
    if (!isAdmin || !isCurrentMonth || !onDateDoubleClick) return
    const date = new Date(year, month - 1, day)
    onDateDoubleClick(date)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={cn(
              'min-h-[100px] md:min-h-[120px] border-b border-r border-border p-1.5 transition-colors',
              !day.isCurrentMonth && 'bg-muted/30 text-muted-foreground',
              day.isCurrentMonth && isAdmin && 'cursor-pointer hover:bg-muted/50',
              index % 7 === 6 && 'border-r-0'
            )}
            onDoubleClick={() => handleDoubleClick(day.date, day.isCurrentMonth)}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                  isToday(day.date) && day.isCurrentMonth && 'bg-primary text-primary-foreground font-medium',
                  !isToday(day.date) && day.isCurrentMonth && 'text-foreground',
                  !day.isCurrentMonth && 'text-muted-foreground'
                )}
              >
                {day.date}
              </span>
              {day.events.length > 3 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  +{day.events.length - 2}
                </Badge>
              )}
            </div>
            
            <div className="space-y-0.5 overflow-hidden">
              {day.events.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className={cn(
                    'block px-1.5 py-0.5 rounded text-[10px] md:text-xs truncate transition-colors',
                    eventTypeBgLight[event.tipoEvento]
                  )}
                  title={event.titulo}
                >
                  <span className="font-medium">{event.horaDesde}</span>
                  <span className="ml-1 hidden md:inline">{event.titulo}</span>
                  <span className="ml-1 md:hidden">{event.titulo.slice(0, 10)}...</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
