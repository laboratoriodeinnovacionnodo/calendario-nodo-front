'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { CalendarResponse } from '@/types'
import { Header } from '@/components/layout/header'
import { CalendarGrid } from '@/components/calendar/calendar-grid'
import { MonthNavigator } from '@/components/calendar/month-navigator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function CalendarPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await api.getCalendar(currentDate.year, currentDate.month)
      setCalendarData(data)
    } catch (err) {
      const error = err as { message?: string }
      setError(error.message || 'Error al cargar el calendario')
    } finally {
      setIsLoading(false)
    }
  }, [currentDate.year, currentDate.month])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 }
      }
      return { ...prev, month: prev.month - 1 }
    })
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 }
      }
      return { ...prev, month: prev.month + 1 }
    })
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentDate({ year: now.getFullYear(), month: now.getMonth() + 1 })
  }

  const handleDateDoubleClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    router.push(`/dashboard/events/new?date=${dateStr}`)
  }

  return (
    <>
      <Header
        title="Calendario"
        description="Vista mensual de eventos"
        action={
          isAdmin && (
            <Link href="/dashboard/events/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo evento
              </Button>
            </Link>
          )
        }
      />

      <div className="p-4 md:p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <MonthNavigator
          year={currentDate.year}
          month={currentDate.month}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {isAdmin && (
              <p className="mb-3 text-sm text-muted-foreground">
                Doble clic en una fecha para crear un evento
              </p>
            )}
            <CalendarGrid
              year={currentDate.year}
              month={currentDate.month}
              events={calendarData?.events || []}
              onDateDoubleClick={handleDateDoubleClick}
              isAdmin={isAdmin}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              Total de eventos este mes: {calendarData?.totalEvents || 0}
            </div>
          </>
        )}
      </div>
    </>
  )
}
