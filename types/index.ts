// User types
export type UserRole = 'ADMIN' | 'VEEDOR'

export interface User {
  id: string
  nombre: string
  email: string
  rol: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  user: User
  access_token: string
}

// Event types
export type EventType = 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO' | 'MASIVO' | 'ESCOLAR'
export type AreaType = 'COWORKING' | 'AUDITORIO' | 'LABORATORIO' | 'AULA_1' | 'AULA_2' | 'AULA_3' | 'AULA_4' | 'AULA_5' | 'AULA_6' | 'RECEPCION_ESTE' | 'RECEPCION_OESTE' | 'EXPLANADA' | 'PLAZA' | 'SALA_REUNIONES'

export interface Event {
  id: string
  titulo: string
  descripcion?: string
  informacion: string
  fechaDesde: string
  fechaHasta: string
  horaDesde: string
  horaHasta: string
  tipoEvento: EventType
  area: AreaType
  organizadorSolicitante: string
  coberturaPrensaBol: boolean
  anexos: string[]
  contactoFormal: string
  contactoInformal?: string
  convocatoria: number
  createdAt: string
  updatedAt: string
  createdBy: User
}

export interface CreateEventDTO {
  titulo: string
  descripcion?: string
  informacion: string
  fechaDesde: string
  fechaHasta: string
  horaDesde: string
  horaHasta: string
  tipoEvento: EventType
  area: AreaType
  organizadorSolicitante: string
  coberturaPrensaBol: boolean
  anexos: string[]
  contactoFormal: string
  contactoInformal?: string
  convocatoria: number
}

export interface UpdateEventDTO {
  titulo?: string
  descripcion?: string
  informacion?: string
  fechaDesde?: string
  fechaHasta?: string
  horaDesde?: string
  horaHasta?: string
  tipoEvento?: EventType
  area?: AreaType
  organizadorSolicitante?: string
  coberturaPrensaBol?: boolean
  anexos?: string[]
  contactoFormal?: string
  contactoInformal?: string
  convocatoria?: number
}

// Calendar types
export interface CalendarResponse {
  year: number
  month: number
  startDate: string
  endDate: string
  events: Event[]
  totalEvents: number
}

export interface UpcomingEventsResponse {
  startDate: string
  endDate: string
  days: number
  events: Event[]
  totalEvents: number
}

// User management types
export interface CreateUserDTO {
  nombre: string
  email: string
  password: string
  rol: UserRole
}

export interface UpdateUserDTO {
  nombre?: string
  email?: string
  password?: string
  rol?: UserRole
}

// API Error
export interface ApiError {
  message: string
  statusCode: number
}
