import type {
  AuthResponse,
  User,
  Event,
  CreateEventDTO,
  UpdateEventDTO,
  CalendarResponse,
  UpcomingEventsResponse,
  CreateUserDTO,
  UpdateUserDTO,
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de conexión' }))
      throw {
        message: error.message || 'Error en la solicitud',
        statusCode: response.status,
      }
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T
    return JSON.parse(text)
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(nombre: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password }),
    })
  }

  // Users endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users')
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`)
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // Events endpoints
  async getEvents(filters?: {
    fechaDesde?: string
    fechaHasta?: string
    tipoEvento?: string
  }): Promise<Event[]> {
    const params = new URLSearchParams()
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
    if (filters?.tipoEvento) params.append('tipoEvento', filters.tipoEvento)
    
    const queryString = params.toString()
    return this.request<Event[]>(`/events${queryString ? `?${queryString}` : ''}`)
  }

  async getEvent(id: string): Promise<Event> {
    return this.request<Event>(`/events/${id}`)
  }

  async createEvent(data: CreateEventDTO): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEvent(id: string, data: UpdateEventDTO): Promise<Event> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    })
  }

  // Calendar endpoints
  async getCalendar(year: number, month: number): Promise<CalendarResponse> {
    return this.request<CalendarResponse>(`/calendar?year=${year}&month=${month}`)
  }

  async getUpcomingEvents(days: number = 7): Promise<UpcomingEventsResponse> {
    return this.request<UpcomingEventsResponse>(`/calendar/upcoming?days=${days}`)
  }
}

export const api = new ApiClient()
