'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { User } from '@/types'
import { Header } from '@/components/layout/header'
import { UserForm } from '@/components/users/user-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin, isLoading: authLoading } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
      return
    }

    async function fetchUser() {
      try {
        const data = await api.getUser(params.id as string)
        setUser(data)
      } catch (err) {
        const error = err as { message?: string; statusCode?: number }
        if (error.statusCode === 404) {
          setError('Usuario no encontrado')
        } else {
          setError(error.message || 'Error al cargar el usuario')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && isAdmin) {
      fetchUser()
    }
  }, [params.id, isAdmin, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <>
        <Header title="Cargando..." />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </>
    )
  }

  if (!isAdmin) {
    return null
  }

  if (error || !user) {
    return (
      <>
        <Header title="Error" />
        <div className="p-4 md:p-6">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error || 'Usuario no encontrado'}</p>
            <Link href="/dashboard/users">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a usuarios
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Editar Usuario" description={`Editando: ${user.nombre}`} />
      <div className="p-4 md:p-6">
        <UserForm user={user} />
      </div>
    </>
  )
}
