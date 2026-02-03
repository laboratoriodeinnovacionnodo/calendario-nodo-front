'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface MonthNavigatorProps {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function MonthNavigator({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Mes anterior</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Mes siguiente</span>
        </Button>
        <Button variant="outline" onClick={onToday} className="hidden sm:flex bg-transparent">
          <Calendar className="mr-2 h-4 w-4" />
          Hoy
        </Button>
      </div>
      
      <h2 className="text-lg md:text-xl font-semibold text-foreground">
        {MONTHS[month - 1]} {year}
      </h2>
      
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-muted-foreground">Pendiente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground">En Curso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Finalizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-muted-foreground">Masivo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
