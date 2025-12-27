import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Product } from '@/lib/api/product'
import { getImageUrl } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { productApi } from '@/lib/api/product'
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

interface ProductTableProps {
  products: Array<Product>
  loading?: boolean
  error?: unknown
}

export function ProductTable({
  products,
  loading = false,
  error,
}: ProductTableProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowDeleteConfirm(false)
      setDeletingId(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete product',
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

  if (products.length === 0 || error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No products found.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Images</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex gap-1">
                    {product.images.slice(0, 3).map((image, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(image)}
                        alt={`${product.name} ${idx + 1}`}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ))}
                    {product.images.length > 3 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                        +{product.images.length - 3}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                    {product.category.name}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: `/product/${product.id}` })}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: `/product/${product.id}` })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(product.id)}
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
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot
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
