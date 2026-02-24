'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Event, UpcomingEventsResponse } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarDays, Clock, ArrowRight } from 'lucide-react'
import { cn, parseLocalDate, getDaysUntil } from '@/lib/utils'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/constants'

export function UpcomingEvents() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<UpcomingEventsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError('')
      try {
        const response = await api.getUpcomingEvents(days)
        setData(response)
      } catch (err) {
        const error = err as { message?: string }
        setError(error.message || 'Error al cargar eventos')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [days])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>
            Eventos en los próximos {days} días
          </CardDescription>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 días</SelectItem>
            <SelectItem value="14">14 días</SelectItem>
            <SelectItem value="30">30 días</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : data?.events && data.events.length > 0 ? (
          <div className="space-y-3">
            {data.events.map((event) => {
              const daysUntil = getDaysUntil(event.fechaDesde)
              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center min-w-[48px] h-12 rounded-lg bg-muted">
                      <span className="text-xs text-muted-foreground uppercase">
                        {parseLocalDate(event.fechaDesde).toLocaleDateString('es-ES', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {parseLocalDate(event.fechaDesde).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">
                          {event.titulo}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn('shrink-0', EVENT_TYPE_COLORS[event.tipoEvento])}
                        >
                          {EVENT_TYPE_LABELS[event.tipoEvento]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.horaDesde} - {event.horaHasta}
                        </span>
                        {daysUntil === 0 && (
                          <span className="text-amber-600 font-medium">Hoy</span>
                        )}
                        {daysUntil === 1 && (
                          <span className="text-amber-600 font-medium">Mañana</span>
                        )}
                        {daysUntil > 1 && (
                          <span>En {daysUntil} días</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            <div className="pt-2">
              <Link href="/dashboard/events">
                <Button variant="ghost" className="w-full">
                  Ver todos los eventos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay eventos próximos</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
