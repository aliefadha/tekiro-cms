import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, Pencil, Save } from 'lucide-react'
import { toast } from 'sonner'
import { productApi } from '@/lib/api/product'
import { categoryApi } from '@/lib/api/category'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductViewMode } from '@/components/product/product-view-mode'
import { ProductEditMode } from '@/components/product/product-edit-mode'

export const Route = createFileRoute('/_authenticated/product/$id')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const queryClient = useQueryClient()
  const { id } = Route.useParams()
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  const updateMutation = useMutation({
    mutationFn: productApi.updateProduct,
    onSuccess: () => {
      toast.success('Product updated successfully')
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setViewMode('view')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update product',
      )
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load product. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {viewMode === 'view' ? 'Product Details' : 'Edit Product'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'view'
                ? 'View product information'
                : 'Edit product content'}
            </p>
          </div>
          {viewMode === 'view' ? (
            <Button onClick={() => setViewMode('edit')} size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode('view')}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const form = document.getElementById(
                    'edit-form',
                  ) as HTMLFormElement
                  form.dispatchEvent(
                    new Event('submit', { bubbles: true, cancelable: true }),
                  )
                }}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'view' ? (
            <ProductViewMode product={product} />
          ) : (
            <ProductEditMode
              product={product}
              categories={categories}
              onCancel={() => setViewMode('view')}
              isPending={updateMutation.isPending}
              onSubmit={(_, files, imagesToDelete) => {
                const form = document.getElementById(
                  'edit-form',
                ) as HTMLFormElement

                const nameInput = form.querySelector(
                  '[name="name"]',
                ) as HTMLInputElement
                const descriptionInput = form.querySelector(
                  '[name="description"]',
                ) as HTMLTextAreaElement
                const categoryInput = form.querySelector(
                  '[name="categoryId"]',
                ) as HTMLSelectElement

                if (
                  !nameInput.value ||
                  !descriptionInput.value ||
                  !categoryInput.value
                ) {
                  toast.error('Please fill in all required fields')
                  return
                }

                updateMutation.mutate({
                  id: product.id,
                  name: nameInput.value.trim(),
                  description: descriptionInput.value.trim(),
                  files,
                  imagesToDelete,

                  categoryId: categoryInput.value,
                })
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
