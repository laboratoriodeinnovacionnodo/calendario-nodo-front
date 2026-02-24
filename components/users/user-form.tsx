'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User, CreateUserDTO, UpdateUserDTO, UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface UserFormProps {
  user?: User
}

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VEEDOR', label: 'Veedor' },
]

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()
  const isEditing = !!user

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    password: '',
    rol: user?.rol || ('VEEDOR' as UserRole),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido'
    }
    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
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
      if (isEditing && user) {
        const updateData: UpdateUserDTO = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        await api.updateUser(user.id, updateData)
      } else {
        const createData: CreateUserDTO = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
        }
        await api.createUser(createData)
      }
      router.push('/dashboard/users')
      router.refresh()
    } catch (err) {
      const error = err as { message?: string; statusCode?: number }
      if (error.statusCode === 409) {
        setSubmitError('Ya existe un usuario con este correo electrónico')
      } else {
        setSubmitError(error.message || 'Error al guardar el usuario')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <CardTitle>{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</CardTitle>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {submitError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Nombre del usuario"
              disabled={isLoading}
            />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={isEditing ? 'Nueva contraseña' : 'Mínimo 6 caracteres'}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <Select
              value={formData.rol}
              onValueChange={(value) => handleChange('rol', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Link href="/dashboard/users">
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
              isEditing ? 'Guardar cambios' : 'Crear usuario'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
