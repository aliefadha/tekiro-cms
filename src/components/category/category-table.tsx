import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Category } from '@/lib/api/category'
import { getImageUrl } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { categoryApi } from '@/lib/api/category'
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

interface CategoryTableProps {
  categories: Array<Category>
  loading?: boolean
  error?: unknown
  onEdit: (category: Category) => void
}

export function CategoryTable({
  categories,
  loading = false,
  error,
  onEdit,
}: CategoryTableProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowDeleteConfirm(false)
      setDeletingId(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete category',
      )
    },
  })

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    setShowDeleteConfirm(true)
  }

  function handleConfirmDelete() {
    if (deletingId) {
      deleteMutation.mutate(deletingId)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (categories.length === 0 || error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No categories found.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate({ to: `/category/${category.id}` })
                      }
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
