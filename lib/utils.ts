import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string (YYYY-MM-DD or ISO format) as a local date
 * This fixes timezone issues where "2025-01-22" would be interpreted as UTC
 * and show as "21" in negative timezone offsets
 */
export function parseLocalDate(dateString: string): Date {
  const datePart = dateString.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Format a date string to a localized display format
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('es-ES', options ?? {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Calculate days since a date from today (negative = days ago)
 */
export function getDaysSince(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = parseLocalDate(dateString)
  const diffTime = today.getTime() - eventDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate days until a date from today (positive = days in future)
 */
export function getDaysUntil(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = parseLocalDate(dateString)
  const diffTime = eventDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
