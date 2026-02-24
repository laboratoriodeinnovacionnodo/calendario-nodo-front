'use client'

import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Event, CreateEventDTO, UpdateEventDTO, EventType, AreaType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { EVENT_TYPE_LABELS, AREA_LABELS } from '@/lib/constants'

interface EventFormProps {
  event?: Event
  defaultDate?: string
  cloneEvent?: Event
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'PENDIENTE', label: EVENT_TYPE_LABELS.PENDIENTE },
  { value: 'EN_CURSO', label: EVENT_TYPE_LABELS.EN_CURSO },
  { value: 'FINALIZADO', label: EVENT_TYPE_LABELS.FINALIZADO },
  { value: 'CANCELADO', label: EVENT_TYPE_LABELS.CANCELADO },
  { value: 'MASIVO', label: EVENT_TYPE_LABELS.MASIVO },
  { value: 'ESCOLAR', label: EVENT_TYPE_LABELS.ESCOLAR },
]

const AREAS: { value: AreaType; label: string }[] = [
  { value: 'COWORKING', label: AREA_LABELS.COWORKING },
  { value: 'AUDITORIO', label: AREA_LABELS.AUDITORIO },
  { value: 'LABORATORIO', label: AREA_LABELS.LABORATORIO },
  { value: 'AULA_1', label: AREA_LABELS.AULA_1 },
  { value: 'AULA_2', label: AREA_LABELS.AULA_2 },
  { value: 'AULA_3', label: AREA_LABELS.AULA_3 },
  { value: 'AULA_4', label: AREA_LABELS.AULA_4 },
  { value: 'AULA_5', label: AREA_LABELS.AULA_5 },
  { value: 'AULA_6', label: AREA_LABELS.AULA_6 },
  { value: 'RECEPCION_ESTE', label: AREA_LABELS.RECEPCION_ESTE },
  { value: 'RECEPCION_OESTE', label: AREA_LABELS.RECEPCION_OESTE },
  { value: 'EXPLANADA', label: AREA_LABELS.EXPLANADA },
  { value: 'PLAZA', label: AREA_LABELS.PLAZA },
  { value: 'SALA_REUNIONES', label: AREA_LABELS.SALA_REUNIONES },
]

export function EventForm({ event, defaultDate, cloneEvent }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event
  const sourceEvent = event || cloneEvent

  const [formData, setFormData] = useState({
    titulo: sourceEvent?.titulo ? `${sourceEvent.titulo}` : '',
    descripcion: sourceEvent?.descripcion || '',
    informacion: sourceEvent?.informacion || '',
    fechaDesde: sourceEvent?.fechaDesde?.split('T')[0] || defaultDate || '',
    fechaHasta: sourceEvent?.fechaHasta?.split('T')[0] || defaultDate || '',
    horaDesde: sourceEvent?.horaDesde || '09:00',
    horaHasta: sourceEvent?.horaHasta || '10:00',
    tipoEvento: sourceEvent?.tipoEvento || ('PENDIENTE' as EventType),
    areas: sourceEvent?.areas || (['COWORKING'] as AreaType[]),
    organizadorSolicitante: sourceEvent?.organizadorSolicitante || '',
    coberturaPrensaBol: sourceEvent?.coberturaPrensaBol || false,
    contactoFormal: sourceEvent?.contactoFormal || '',
    contactoInformal: sourceEvent?.contactoInformal || '',
    convocatoria: sourceEvent?.convocatoria || 0,
  })

  const [anexos, setAnexos] = useState<string[]>(sourceEvent?.anexos || [''])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido'
    }
    if (!formData.informacion.trim()) {
      newErrors.informacion = 'La información es requerida'
    }
    if (!formData.fechaDesde) {
      newErrors.fechaDesde = 'La fecha de inicio es requerida'
    }
    if (!formData.fechaHasta) {
      newErrors.fechaHasta = 'La fecha de fin es requerida'
    }
    if (formData.fechaDesde && formData.fechaHasta && formData.fechaHasta < formData.fechaDesde) {
      newErrors.fechaHasta = 'La fecha de fin debe ser igual o posterior a la fecha de inicio'
    }
    if (!formData.horaDesde) {
      newErrors.horaDesde = 'La hora de inicio es requerida'
    }
    if (!formData.horaHasta) {
      newErrors.horaHasta = 'La hora de fin es requerida'
    }
    if (formData.fechaDesde === formData.fechaHasta && formData.horaDesde && formData.horaHasta && formData.horaHasta <= formData.horaDesde) {
      newErrors.horaHasta = 'La hora de fin debe ser posterior a la hora de inicio'
    }
    if (!formData.organizadorSolicitante.trim()) {
      newErrors.organizadorSolicitante = 'El organizador es requerido'
    }
    if (!formData.contactoFormal.trim()) {
      newErrors.contactoFormal = 'El contacto formal es requerido'
    }
    if (formData.convocatoria < 0) {
      newErrors.convocatoria = 'La convocatoria debe ser mayor o igual a 0'
    }

    // Validate anexos URLs
    const validAnexos = anexos.filter(a => a.trim())
    for (const anexo of validAnexos) {
      try {
        new URL(anexo)
      } catch {
        newErrors.anexos = 'Todos los anexos deben ser URLs válidas'
        break
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const validAnexos = anexos.filter(a => a.trim())
      
      const eventData = {
        ...formData,
        anexos: validAnexos,
      }

      if (isEditing && event) {
        await api.updateEvent(event.id, eventData)
        router.refresh() // Refresh server data to update calendar
      } else {
        await api.createEvent(eventData)
      }

      router.push('/dashboard/events')
      router.refresh()
    } catch (err) {
      const error = err as { message?: string }
      setSubmitError(error.message || 'Error al guardar el evento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number | boolean | AreaType[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleArea = (area: AreaType) => {
    const currentAreas = formData.areas
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area]
    
    // Ensure at least one area is selected
    if (newAreas.length > 0) {
      handleChange('areas', newAreas)
    }
  }

  const addAnexo = () => {
    if (anexos.length < 4) {
      setAnexos([...anexos, ''])
    }
  }

  const removeAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index))
  }

  const updateAnexo = (index: number, value: string) => {
    const newAnexos = [...anexos]
    newAnexos[index] = value
    setAnexos(newAnexos)
    if (errors.anexos) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.anexos
        return newErrors
      })
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <CardTitle>
              {isEditing ? 'Editar Evento' : cloneEvent ? 'Regenerar Evento' : 'Crear Nuevo Evento'}
            </CardTitle>
            {cloneEvent && (
              <p className="text-sm text-muted-foreground mt-1">
                Creando nuevo evento basado en: {cloneEvent.titulo}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {submitError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Información Básica</h3>
            
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Nombre del evento"
                disabled={isLoading}
              />
              {errors.titulo && <p className="text-sm text-destructive">{errors.titulo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Breve descripción del evento (opcional)"
                rows={2}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="informacion">Información adicional *</Label>
              <Textarea
                id="informacion"
                value={formData.informacion}
                onChange={(e) => handleChange('informacion', e.target.value)}
                placeholder="Detalles adicionales del evento"
                rows={3}
                disabled={isLoading}
              />
              {errors.informacion && <p className="text-sm text-destructive">{errors.informacion}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoEvento">Tipo de evento *</Label>
                <Select
                  value={formData.tipoEvento}
                  onValueChange={(value) => handleChange('tipoEvento', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <Label>Áreas * (Selecciona una o más)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                {AREAS.map((area) => (
                  <div key={area.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${area.value}`}
                      checked={formData.areas.includes(area.value)}
                      onCheckedChange={() => toggleArea(area.value)}
                      disabled={isLoading}
                    />
                    <Label 
                      htmlFor={`area-${area.value}`} 
                      className="cursor-pointer text-sm"
                    >
                      {area.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.areas.length === 0 && (
                <p className="text-sm text-destructive">Debes seleccionar al menos un área</p>
              )}
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Fechas y Horarios</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaDesde">Fecha de inicio *</Label>
                <Input
                  id="fechaDesde"
                  type="date"
                  value={formData.fechaDesde}
                  onChange={(e) => handleChange('fechaDesde', e.target.value)}
                  disabled={isLoading}
                />
                {errors.fechaDesde && <p className="text-sm text-destructive">{errors.fechaDesde}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaHasta">Fecha de fin *</Label>
                <Input
                  id="fechaHasta"
                  type="date"
                  value={formData.fechaHasta}
                  onChange={(e) => handleChange('fechaHasta', e.target.value)}
                  min={formData.fechaDesde}
                  disabled={isLoading}
                />
                {errors.fechaHasta && <p className="text-sm text-destructive">{errors.fechaHasta}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaDesde">Hora de inicio *</Label>
                <Input
                  id="horaDesde"
                  type="time"
                  value={formData.horaDesde}
                  onChange={(e) => handleChange('horaDesde', e.target.value)}
                  disabled={isLoading}
                />
                {errors.horaDesde && <p className="text-sm text-destructive">{errors.horaDesde}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaHasta">Hora de fin *</Label>
                <Input
                  id="horaHasta"
                  type="time"
                  value={formData.horaHasta}
                  onChange={(e) => handleChange('horaHasta', e.target.value)}
                  disabled={isLoading}
                />
                {errors.horaHasta && <p className="text-sm text-destructive">{errors.horaHasta}</p>}
              </div>
            </div>
          </div>

          {/* Organización */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Organización</h3>
            
            <div className="space-y-2">
              <Label htmlFor="organizadorSolicitante">Organizador/Solicitante *</Label>
              <Input
                id="organizadorSolicitante"
                value={formData.organizadorSolicitante}
                onChange={(e) => handleChange('organizadorSolicitante', e.target.value)}
                placeholder="Ej: Juan Pérez - Departamento IT"
                disabled={isLoading}
              />
              {errors.organizadorSolicitante && <p className="text-sm text-destructive">{errors.organizadorSolicitante}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="convocatoria">Convocatoria (N° de asistentes) *</Label>
                <Input
                  id="convocatoria"
                  type="number"
                  min={0}
                  value={formData.convocatoria}
                  onChange={(e) => handleChange('convocatoria', Number(e.target.value))}
                  placeholder="0"
                  disabled={isLoading}
                />
                {errors.convocatoria && <p className="text-sm text-destructive">{errors.convocatoria}</p>}
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2 pb-2">
                  <Checkbox
                    id="coberturaPrensaBol"
                    checked={formData.coberturaPrensaBol}
                    onCheckedChange={(checked) => handleChange('coberturaPrensaBol', checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="coberturaPrensaBol" className="cursor-pointer">
                    ¿Requiere cobertura de prensa?
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Contactos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contactos</h3>
            
            <div className="space-y-2">
              <Label htmlFor="contactoFormal">Contacto Formal *</Label>
              <Input
                id="contactoFormal"
                value={formData.contactoFormal}
                onChange={(e) => handleChange('contactoFormal', e.target.value)}
                placeholder="+54 11 1234-5678"
                disabled={isLoading}
              />
              {errors.contactoFormal && <p className="text-sm text-destructive">{errors.contactoFormal}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactoInformal">Contacto Informal (opcional)</Label>
              <Input
                id="contactoInformal"
                value={formData.contactoInformal}
                onChange={(e) => handleChange('contactoInformal', e.target.value)}
                placeholder="email@ejemplo.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Anexos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Anexos (Máximo 4)</h3>
            
            <div className="space-y-3">
              {anexos.map((anexo, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    value={anexo}
                    onChange={(e) => updateAnexo(index, e.target.value)}
                    placeholder="https://drive.google.com/..."
                    disabled={isLoading}
                  />
                  {anexos.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAnexo(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.anexos && <p className="text-sm text-destructive">{errors.anexos}</p>}
              
              {anexos.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAnexo}
                  disabled={isLoading}
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar anexo
                </Button>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Link href="/dashboard/events">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Guardando...' : 'Creando...'}
              </>
            ) : (
              isEditing ? 'Guardar cambios' : 'Crear evento'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
