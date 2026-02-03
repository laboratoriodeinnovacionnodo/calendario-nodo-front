'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Event } from '@/types'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Pencil, Trash2, Calendar, Clock, User, Info, MapPin, Phone, FileText, ExternalLink } from 'lucide-react'
import { cn, parseLocalDate } from '@/lib/utils'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, AREA_COLORS, AREA_LABELS } from '@/lib/constants'

function formatEventDate(dateString: string): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDate(dateString: string): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await api.getEvent(params.id as string)
        setEvent(data)
      } catch (err) {
        const error = err as { message?: string; statusCode?: number }
        if (error.statusCode === 404) {
          setError('Evento no encontrado')
        } else {
          setError(error.message || 'Error al cargar el evento')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [params.id])

  const handleDelete = async () => {
    if (!event) return
    setIsDeleting(true)
    try {
      await api.deleteEvent(event.id)
      router.push('/dashboard/events')
    } catch (err) {
      const error = err as { message?: string }
      setError(error.message || 'Error al eliminar el evento')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Cargando..." />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Header title="Error" />
        <div className="p-4 md:p-6">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error || 'Evento no encontrado'}</p>
            <Link href="/dashboard/events">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a eventos
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title={event.titulo}
        action={
          isAdmin && (
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/events/${event.id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          )
        }
      />

      <div className="p-4 md:p-6">
        <div className="mb-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a eventos
            </Button>
          </Link>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{event.titulo}</CardTitle>
                  <p className="text-muted-foreground mt-1">{event.descripcion}</p>
                </div>
                <Badge className={cn('shrink-0', EVENT_TYPE_COLORS[event.tipoEvento])} variant="outline">
                  {EVENT_TYPE_LABELS[event.tipoEvento]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Fecha</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {formatEventDate(event.fechaDesde)}
                    </p>
                    {event.fechaDesde !== event.fechaHasta && (
                      <p className="text-sm text-muted-foreground capitalize">
                        hasta {formatEventDate(event.fechaHasta)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Horario</p>
                    <p className="text-sm text-muted-foreground">
                      {event.horaDesde} - {event.horaHasta}
                    </p>
                  </div>
                </div>
              </div>

              {/* Area */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Área</p>
                  <Badge className={`${AREA_COLORS[event.area]} text-white mt-1`}>
                    {AREA_LABELS[event.area]}
                  </Badge>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-2">Información adicional</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.informacion}
                  </p>
                </div>
              </div>

              {/* Organizador */}
              <div className="flex items-start gap-3 pt-4 border-t border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Organizador / Solicitante</p>
                  <p className="text-sm text-muted-foreground">{event.organizadorSolicitante}</p>
                </div>
              </div>

              {/* Contactos */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Contactos</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Formal:</strong> {event.contactoFormal}
                  </p>
                  {event.contactoInformal && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Informal:</strong> {event.contactoInformal}
                    </p>
                  )}
                </div>
              </div>

              {/* Convocatoria y Cobertura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium text-foreground">Convocatoria</p>
                    <p className="text-sm text-muted-foreground">{event.convocatoria} asistentes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium text-foreground">Cobertura de Prensa</p>
                    <p className="text-sm text-muted-foreground">
                      {event.coberturaPrensaBol ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Anexos */}
              {event.anexos && event.anexos.length > 0 && (
                <div className="flex items-start gap-3 pt-4 border-t border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-2">Anexos</p>
                    <div className="space-y-2">
                      {event.anexos.map((anexo, index) => (
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
                </div>
              )}

              {/* Creator Info */}
              {event.createdBy && (
                <div className="flex items-start gap-3 pt-4 border-t border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Creado por</p>
                    <p className="text-sm text-muted-foreground">{event.createdBy.nombre}</p>
                    <p className="text-xs text-muted-foreground">{event.createdBy.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="text-sm text-muted-foreground text-center">
            Creado el {formatDate(event.createdAt)}
            {event.updatedAt !== event.createdAt && (
              <span>
                {' '}· Última actualización: {formatDate(event.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento &quot;{event.titulo}&quot; será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
