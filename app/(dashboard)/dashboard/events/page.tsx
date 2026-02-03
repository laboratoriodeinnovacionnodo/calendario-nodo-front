'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Event, EventType } from '@/types'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, Pencil, Trash2, Eye, Calendar, Filter, X } from 'lucide-react'
import { cn, parseLocalDate } from '@/lib/utils'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/constants'

export default function EventsPage() {
  const { isAdmin } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    tipoEvento: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await api.getEvents({
        fechaDesde: filters.fechaDesde || undefined,
        fechaHasta: filters.fechaHasta || undefined,
        tipoEvento: filters.tipoEvento || undefined,
      })
      setEvents(data)
    } catch (err) {
      const error = err as { message?: string }
      setError(error.message || 'Error al cargar eventos')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await api.deleteEvent(deleteId)
      setEvents((prev) => prev.filter((e) => e.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      const error = err as { message?: string }
      setError(error.message || 'Error al eliminar el evento')
    } finally {
      setIsDeleting(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: '',
      tipoEvento: '',
    })
  }

  const hasActiveFilters = filters.fechaDesde || filters.fechaHasta || filters.tipoEvento

  return (
    <>
      <Header
        title="Eventos"
        description="Gestiona todos los eventos del calendario"
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

      <div className="p-4 md:p-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[filters.fechaDesde, filters.fechaHasta, filters.tipoEvento].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Desde</label>
              <Input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters((prev) => ({ ...prev, fechaDesde: e.target.value }))}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Hasta</label>
              <Input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters((prev) => ({ ...prev, fechaHasta: e.target.value }))}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Tipo</label>
              <Select
                value={filters.tipoEvento}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, tipoEvento: value === 'ALL' ? '' : value }))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="EN_CURSO">En Curso</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="MASIVO">Masivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Events Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No se encontraron eventos</p>
            {isAdmin && (
              <Link href="/dashboard/events/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer evento
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="hidden sm:table-cell">Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{event.titulo}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {event.descripcion}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden mt-1">
                          {parseLocalDate(event.fechaDesde).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        <p>{parseLocalDate(event.fechaDesde).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}</p>
                        {event.fechaDesde !== event.fechaHasta && (
                          <p className="text-muted-foreground">
                            - {parseLocalDate(event.fechaHasta).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm">
                        {event.horaDesde} - {event.horaHasta}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(EVENT_TYPE_COLORS[event.tipoEvento])}>
                        {EVENT_TYPE_LABELS[event.tipoEvento]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/events/${event.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                        </Link>
                        {isAdmin && (
                          <>
                            <Link href={`/dashboard/events/${event.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(event.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado permanentemente.
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
