'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Event, UpcomingEventsResponse } from '@/types'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  CalendarCheck, 
  CalendarClock, 
  Calendar,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { cn, parseLocalDate, getDaysUntil, getDaysSince } from '@/lib/utils'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/constants'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [upcomingData, setUpcomingData] = useState<UpcomingEventsResponse | null>(null)
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [upcoming, events] = await Promise.all([
          api.getUpcomingEvents(7),
          api.getEvents(),
        ])
        setUpcomingData(upcoming)
        setAllEvents(events)
      } catch (err) {
        const error = err as { message?: string }
        setError(error.message || 'Error al cargar datos')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = {
    total: allEvents.length,
    pendientes: allEvents.filter(e => e.tipoEvento === 'PENDIENTE').length,
    enCurso: allEvents.filter(e => e.tipoEvento === 'EN_CURSO').length,
    finalizados: allEvents.filter(e => e.tipoEvento === 'FINALIZADO').length,
  }

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" description="Bienvenido de vuelta" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header 
        title="Dashboard" 
        description={`Bienvenido, ${user?.nombre}`}
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
      
      <div className="p-4 md:p-6 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Eventos
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pendientes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Curso
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.enCurso}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Finalizados
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.finalizados}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Events */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Eventos en los últimos 7 días</CardDescription>
              </div>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" size="sm">
                  Ver calendario
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingData?.events && upcomingData.events.length > 0 ? (
                <div className="space-y-4">
                  {upcomingData.events
                    .filter((event) => {
                      const daysSince = getDaysSince(event.fechaDesde)
                      return daysSince >= -7 && daysSince <= 0
                    })
                    .slice(0, 5)
                    .map((event) => {
                      const daysSince = getDaysSince(event.fechaDesde)
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
                                {daysSince === 0 && (
                                  <span className="text-amber-600 font-medium">Hoy</span>
                                )}
                                {daysSince === -1 && (
                                  <span className="text-blue-600 font-medium">Ayer</span>
                                )}
                                {daysSince < -1 && (
                                  <span>Hace {Math.abs(daysSince)} días</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay eventos en los últimos 7 días</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Accesos directos a funciones comunes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/calendar" className="block">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ver Calendario</p>
                    <p className="text-sm text-muted-foreground">Vista mensual de eventos</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/dashboard/events" className="block">
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CalendarDays className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Todos los Eventos</p>
                    <p className="text-sm text-muted-foreground">Lista completa de eventos</p>
                  </div>
                </div>
              </Link>

              {isAdmin && (
                <>
                  <Link href="/dashboard/events/new" className="block">
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                        <Plus className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Crear Evento</p>
                        <p className="text-sm text-muted-foreground">Agregar un nuevo evento</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/dashboard/users" className="block">
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                        <Plus className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Gestionar Usuarios</p>
                        <p className="text-sm text-muted-foreground">Administrar usuarios del sistema</p>
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
