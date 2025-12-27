import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/api-client'
import { productApi } from '@/lib/api/product'
import { categoryApi } from '@/lib/api/category'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/_authenticated/product/$id')({
  component: ProductDetailPage,
})

function EditProductDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<Array<File>>([])
  const [previews, setPreviews] = useState<Array<string>>([])
  const [storeUrl, setStoreUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  const updateMutation = useMutation({
    mutationFn: productApi.updateProduct,
    onSuccess: () => {
      toast.success('Product updated successfully')
      queryClient.invalidateQueries({ queryKey: ['product', product.id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update product',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/'),
    )

    if (validFiles.length < selectedFiles.length) {
      toast.error('Some files were not images and were skipped')
    }

    if (validFiles.length === 0) return

    setFiles((prev) => [...prev, ...validFiles])

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () =>
        setPreviews((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product || !name.trim() || !description.trim() || !categoryId) {
      toast.error('Please provide name, description, and category')
      return
    }
    updateMutation.mutate({
      id: product.id,
      name: name.trim(),
      description: description.trim(),
      files: files.length > 0 ? files : undefined,
      storeUrl: storeUrl.trim() || undefined,
      categoryId,
    })
  }

  function handleClose() {
    setName('')
    setDescription('')
    setFiles([])
    setPreviews([])
    setStoreUrl('')
    setCategoryId('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  function populateForm() {
    if (!product) return
    setName(product.name)
    setDescription(product.description)
    setStoreUrl(product.storeUrl || '')
    setCategoryId(product.categoryId)
  }

  useEffect(() => {
    if (open && product) {
      populateForm()
    }
  }, [open, product])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-storeUrl">Store URL (Optional)</Label>
            <Input
              id="edit-storeUrl"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="https://tokopedia.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-files">Replace Images (Optional)</Label>
            {previews.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square w-full rounded-lg overflow-hidden border"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <span className="sr-only">Remove image</span>×
                    </Button>
                  </div>
                ))}
                <div className="aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add More
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <Input
                    ref={fileInputRef}
                    id="edit-files"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProductDetailPage() {
  const { id } = Route.useParams()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
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
              Product Details
            </h1>
            <p className="text-muted-foreground">View product information</p>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">ID</p>
              <p className="font-mono text-sm">{product.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Category</p>
              <p className="font-medium">{product.category.name}</p>
            </div>
            {product.storeUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Store URL</p>
                <a
                  href={product.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Visit Store
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{product.description}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Images</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <EditProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={product}
      />
    </div>
  )
}
