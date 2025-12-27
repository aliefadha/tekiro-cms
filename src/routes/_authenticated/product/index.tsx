import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { productApi } from '@/lib/api/product'
import { categoryApi } from '@/lib/api/category'
import { ProductTable } from '@/components/product/product-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

export const Route = createFileRoute('/_authenticated/product/')({
  component: ProductPage,
})

function CreateProductDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
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

  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      toast.success('Product created successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create product',
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
    if (!name.trim() || !description.trim() || !categoryId) {
      toast.error('Please provide name, description, and category')
      return
    }
    if (files.length === 0) {
      toast.error('Please upload at least one image')
      return
    }
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      files,
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a new product to your collection
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="category">
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
            <Label htmlFor="storeUrl">Store URL (Optional)</Label>
            <Input
              id="storeUrl"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="https://tokopedia.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="files">Images</Label>
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
                    id="files"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    required
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProductPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product</h1>
        <p className="text-muted-foreground">Manage your products</p>
      </div>
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <ProductTable products={products} loading={isLoading} error={error} />
      <CreateProductDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
