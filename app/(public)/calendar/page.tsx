'use client'

import Link from "next/link"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Phone, Mail, FileText, ExternalLink, MessageCircle } from 'lucide-react'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, AREA_COLORS, AREA_LABELS } from '@/lib/constants'
import { parseLocalDate, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function PublicCalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    const unlocked = sessionStorage.getItem('calendar_unlocked')
    if (unlocked !== 'true') {
      router.push('/')
      return
    }

    loadEvents()
  }, [currentDate, router])

  const loadEvents = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const response = await api.getCalendar(year, month)
      setEvents(response.events)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    return events.filter((event) => {
      const eventStart = event.fechaDesde.split('T')[0]
      const eventEnd = event.fechaHasta.split('T')[0]
      return dateStr >= eventStart && dateStr <= eventEnd
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleWhatsAppClick = (event: Event) => {
    const phone = event.contactoFormal.replace(/\D/g, '')
    const message = `Hola, le recordamos que tiene un evento programado:\n\n📅 ${event.titulo}\n📍 ${AREA_LABELS[event.area]}\n🗓️ ${formatDate(event.fechaDesde, { day: 'numeric', month: 'long', year: 'numeric' })}\n⏰ ${event.horaDesde} - ${event.horaHasta}\n\nMás información:\n${event.informacion.substring(0, 100)}...`
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = getDaysInMonth()
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground capitalize">Calendario {monthName}</h1>
            <p className="text-muted-foreground mt-1">Vista pública de eventos</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={previousMonth} variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToToday} variant="outline">
              Hoy
            </Button>
            <Button onClick={nextMonth} variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Link href="/login" className="ml-auto sm:ml-0">
              <Button className="gap-2">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando eventos...</p>
          </div>
        ) : (
          <Card className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const dayEvents = getEventsForDay(day)
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear()

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 ${
                      isToday ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted/50'
                    } transition-colors`}
                  >
                    <div className="text-sm font-semibold mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`w-full text-left text-xs p-1 rounded ${
                            EVENT_TYPE_COLORS[event.tipoEvento]
                          } text-white truncate hover:opacity-80 transition-opacity`}
                        >
                          {event.titulo}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedEvent.titulo}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge className={`${EVENT_TYPE_COLORS[selectedEvent.tipoEvento]} text-white`}>
                      {EVENT_TYPE_LABELS[selectedEvent.tipoEvento]}
                    </Badge>
                    <Badge className={`${AREA_COLORS[selectedEvent.area]} text-white`}>
                      <MapPin className="h-3 w-3 mr-1" />
                      {AREA_LABELS[selectedEvent.area]}
                    </Badge>
                  </div>

                  {selectedEvent.descripcion && (
                    <div>
                      <h3 className="font-semibold mb-1">Descripción</h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.descripcion}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-1">Información</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedEvent.informacion}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fechas
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {formatDate(selectedEvent.fechaDesde, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {selectedEvent.fechaDesde !== selectedEvent.fechaHasta && (
                        <p className="text-sm text-muted-foreground capitalize">
                          hasta {formatDate(selectedEvent.fechaHasta, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedEvent.horaDesde} - {selectedEvent.horaHasta}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">Organizador</h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.organizadorSolicitante}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Convocatoria
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedEvent.convocatoria} asistentes</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">Cobertura de Prensa</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.coberturaPrensaBol ? 'Sí' : 'No'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contactos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>Formal:</strong> {selectedEvent.contactoFormal}
                    </p>
                    {selectedEvent.contactoInformal && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Informal:</strong> {selectedEvent.contactoInformal}
                      </p>
                    )}
                  </div>

                  {selectedEvent.anexos && selectedEvent.anexos.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Anexos
                      </h3>
                      <div className="space-y-2">
                        {selectedEvent.anexos.map((anexo, index) => (
                          <a
                            key={index}
                            href={anexo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Anexo {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleWhatsAppClick(selectedEvent)}
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Recordar por WhatsApp
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
