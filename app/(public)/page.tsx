'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function LockScreenPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa la contraseña',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      const correctPassword = process.env.NEXT_PUBLIC_LOCK_PASSWORD || '123'
      
      if (password === correctPassword) {
        sessionStorage.setItem('calendar_unlocked', 'true')
        toast({
          title: 'Acceso concedido',
          description: 'Redirigiendo al calendario...',
        })
        router.push('/calendar')
      } else {
        toast({
          title: 'Acceso denegado',
          description: 'Contraseña incorrecta',
          variant: 'destructive',
        })
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdff] via-[#e0f7ff] to-[#bae6fd]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Calendario NODO</h1>
          <p className="text-muted-foreground">
            Ingresa la contraseña para acceder al calendario
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 text-center text-lg h-12"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base"
            disabled={loading || !password}
          >
            {loading ? 'Verificando...' : 'Acceder al Calendario'}
          </Button>

          <div className="text-center pt-4 border-t">
            <Link 
              href="/login" 
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              Acceso de Administrador
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
