'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { User } from '@/types'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Users, Shield, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  VEEDOR: 'bg-muted text-muted-foreground border-border',
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  VEEDOR: 'Veedor',
}

export default function UsersPage() {
  const { isAdmin, isLoading: authLoading, user: currentUser } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
      return
    }

    async function fetchUsers() {
      try {
        const data = await api.getUsers()
        setUsers(data)
      } catch (err) {
        const error = err as { message?: string }
        setError(error.message || 'Error al cargar usuarios')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, authLoading, router])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await api.deleteUser(deleteId)
      setUsers((prev) => prev.filter((u) => u.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      const error = err as { message?: string }
      setError(error.message || 'Error al eliminar el usuario')
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading || (!isAdmin && isLoading)) {
    return (
      <>
        <Header title="Usuarios" />
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
      <Header
        title="Usuarios"
        description="Gestiona los usuarios del sistema"
        action={
          <Link href="/dashboard/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No se encontraron usuarios</p>
            <Link href="/dashboard/users/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear primer usuario
              </Button>
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {user.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.nombre}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-muted-foreground">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(roleColors[user.rol])}>
                        <Shield className="mr-1 h-3 w-3" />
                        {roleLabels[user.rol]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/users/${user.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(user.id)}
                          disabled={user.id === currentUser?.id}
                          title={user.id === currentUser?.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                        >
                          <Trash2 className={cn(
                            'h-4 w-4',
                            user.id === currentUser?.id ? 'text-muted-foreground' : 'text-destructive'
                          )} />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
