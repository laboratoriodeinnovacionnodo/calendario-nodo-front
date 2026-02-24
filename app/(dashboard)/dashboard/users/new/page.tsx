'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/layout/header'
import { UserForm } from '@/components/users/user-form'

export default function NewUserPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <>
        <Header title="Nuevo Usuario" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <Header title="Nuevo Usuario" description="Crea una nueva cuenta de usuario" />
      <div className="p-4 md:p-6">
        <UserForm />
      </div>
    </>
  )
}
