'use client'

import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/layout/header'
import { EventForm } from '@/components/events/event-form'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Suspense } from 'react'
import Loading from './loading'

export default function NewEventPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard/events')
    }
  }, [isAdmin, isLoading, router])

  return (
    <>
      <Header title="Nuevo Evento" description="Crea un nuevo evento en el calendario" />
      <div className="p-4 md:p-6">
        <Suspense fallback={null}>
          <EventForm />
        </Suspense>
      </div>
    </>
  )
}
