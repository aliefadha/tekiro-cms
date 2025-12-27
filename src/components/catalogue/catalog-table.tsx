import { useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Catalog } from '@/lib/api/catalog'
import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/api-client'
import { catalogApi } from '@/lib/api/catalog'
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

interface CatalogTableProps {
  catalogs: Array<Catalog>
  loading?: boolean
  error?: unknown
  onEdit: (catalog: Catalog) => void
}

export function CatalogTable({
  catalogs,
  loading = false,
  error,
  onEdit,
}: CatalogTableProps) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: catalogApi.deleteCatalog,
    onSuccess: () => {
      toast.success('Catalog deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      setShowDeleteConfirm(false)
      setDeletingId(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete catalog',
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

  if (catalogs.length === 0 || error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No catalogs found.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogs.map((catalog) => (
              <TableRow key={catalog.id}>
                <TableCell className="font-medium">{catalog.title}</TableCell>
                <TableCell>{catalog.category?.name || '-'}</TableCell>
                <TableCell>
                  <a
                    href={getImageUrl(catalog.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <FileText className="mr-1 h-4 w-4" />
                    Open PDF
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(catalog)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(catalog.id)}
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
            <AlertDialogTitle>Delete Catalog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this catalog? This action cannot
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
