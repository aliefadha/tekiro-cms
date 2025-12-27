import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/lib/api/category'
import { categoryApi } from '@/lib/api/category'
import { CategoryTable } from '@/components/category/category-table'
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

export const Route = createFileRoute('/_authenticated/category/')({
  component: CategoryPage,
})

function CreateCategoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      toast.success('Category created successfully')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create category',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  function handleRemoveFile() {
    setFile(null)
    setPreview(null)
    setName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !file) {
      toast.error('Please provide both name and image')
      return
    }
    createMutation.mutate({ name: name.trim(), file })
  }

  function handleClose() {
    setName('')
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Add a new category to your collection
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Image</Label>
            {preview ? (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveFile}
                >
                  <span className="sr-only">Remove image</span>×
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept="image/*"
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
            <Button
              type="submit"
              disabled={createMutation.isPending || !file || !name.trim()}
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const updateMutation = useMutation({
    mutationFn: categoryApi.updateCategory,
    onSuccess: () => {
      toast.success('Category updated successfully')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update category',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  function handleRemoveFile() {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !name.trim()) {
      toast.error('Please provide a name')
      return
    }
    updateMutation.mutate({
      id: category.id,
      name: name.trim(),
      file: file || undefined,
    })
  }

  function handleClose() {
    setName('')
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  function populateForm() {
    if (!category) return
    setName(category.name)
  }

  useEffect(() => {
    if (open && category) {
      populateForm()
    }
  }, [open, category])

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details or delete it
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-file">Replace Image (Optional)</Label>
              {preview ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveFile}
                  >
                    <span className="sr-only">Remove image</span>×
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <Input
                      ref={fileInputRef}
                      id="edit-file"
                      type="file"
                      accept="image/*"
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
    </>
  )
}

function CategoryPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  function handleEdit(category: Category) {
    setEditingCategory(category)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Category</h1>
        <p className="text-muted-foreground">Manage your categories</p>
      </div>
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <CategoryTable
        categories={categories}
        loading={isLoading}
        error={error}
        onEdit={handleEdit}
      />
      <CreateCategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      <EditCategoryDialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        category={editingCategory}
      />
    </div>
  )
}
