'use client'

import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/layout/header'
import { EventForm } from '@/components/events/event-form'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { api } from '@/lib/api'
import type { Event } from '@/types'
import Loading from './loading'

function NewEventContent() {
  const searchParams = useSearchParams()
  const cloneId = searchParams.get('clone')
  const [cloneEvent, setCloneEvent] = useState<Event | undefined>()
  const [isLoadingClone, setIsLoadingClone] = useState(!!cloneId)

  useEffect(() => {
    if (cloneId) {
      api.getEvent(cloneId)
        .then(event => setCloneEvent(event))
        .catch(err => console.error('Error loading event to clone:', err))
        .finally(() => setIsLoadingClone(false))
    }
  }, [cloneId])

  if (isLoadingClone) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return <EventForm cloneEvent={cloneEvent} />
}

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
        <Suspense fallback={<Loading />}>
          <NewEventContent />
        </Suspense>
      </div>
    </>
  )
}
