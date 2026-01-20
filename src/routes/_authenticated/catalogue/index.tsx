import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Catalog } from '@/lib/api/catalog'
import { catalogApi } from '@/lib/api/catalog'
import { categoryApi } from '@/lib/api/category'
import { CatalogTable } from '@/components/catalogue/catalog-table'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/_authenticated/catalogue/')({
  component: CatalogPage,
})

function CreateCatalogDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  const createMutation = useMutation({
    mutationFn: catalogApi.createCatalog,
    onSuccess: () => {
      toast.success('Catalog created successfully')
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      handleClose()
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create catalog',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const isPdf =
        selectedFile.type.includes('pdf') ||
        selectedFile.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        setError('Please select a valid PDF file')
        setFile(null)
        return
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size must be less than 10MB')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  function handleRemoveFile() {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }
    if (trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters')
      return
    }
    if (!categoryId) {
      setError('Please select a category')
      return
    }
    if (!file) {
      setError('Please upload a PDF file')
      return
    }

    createMutation.mutate({
      title: trimmedTitle,
      categoryId,
      file,
    })
  }

  function handleClose() {
    setTitle('')
    setCategoryId('')
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Catalog</DialogTitle>
          <DialogDescription>
            Add a new catalog to your collection
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter catalog title"
              disabled={createMutation.isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={createMutation.isPending}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            {file ? (
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-red-500" />
                <span className="flex-1 text-sm">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={createMutation.isPending}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click to upload PDF file (max 10MB)
                  </p>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={createMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={createMutation.isPending}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
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
              disabled={
                createMutation.isPending ||
                !title.trim() ||
                !categoryId ||
                !file
              }
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditCatalogDialog({
  open,
  onOpenChange,
  catalog,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalog: Catalog | null
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  const updateMutation = useMutation({
    mutationFn: catalogApi.updateCatalog,
    onSuccess: () => {
      toast.success('Catalog updated successfully')
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      handleClose()
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update catalog',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: catalogApi.deleteCatalog,
    onSuccess: () => {
      toast.success('Catalog deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      handleClose()
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete catalog',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const isPdf =
        selectedFile.type.includes('pdf') ||
        selectedFile.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        setError('Please select a valid PDF file')
        setFile(null)
        return
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size must be less than 10MB')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  function handleRemoveFile() {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }
    if (trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters')
      return
    }
    if (!categoryId) {
      setError('Please select a category')
      return
    }
    if (!catalog) return

    updateMutation.mutate({
      id: catalog.id,
      title: trimmedTitle,
      categoryId,
      file: file || undefined,
    })
  }

  function handleClose() {
    setTitle('')
    setCategoryId('')
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  function populateForm() {
    if (!catalog) return
    setTitle(catalog.title)
    setCategoryId(catalog.categoryId)
  }

  useEffect(() => {
    if (open && catalog) {
      populateForm()
    } else if (!open) {
      setTitle('')
      setCategoryId('')
      setFile(null)
      setError(null)
    }
  }, [open, catalog])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Catalog</DialogTitle>
          <DialogDescription>
            Update catalog details or delete it
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter catalog title"
              disabled={updateMutation.isPending || deleteMutation.isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-file">Replace PDF (Optional, max 10MB)</Label>
            {file ? (
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-red-500" />
                <span className="flex-1 text-sm">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={
                    updateMutation.isPending || deleteMutation.isPending
                  }
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click to upload PDF file
                  </p>
                  <Input
                    ref={fileInputRef}
                    id="edit-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={
                      updateMutation.isPending || deleteMutation.isPending
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      updateMutation.isPending || deleteMutation.isPending
                    }
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  catalog &&
                  confirm('Are you sure you want to delete this catalog?')
                ) {
                  deleteMutation.mutate(catalog.id)
                }
              }}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CatalogPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null)

  const {
    data: catalogs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['catalog'],
    queryFn: catalogApi.getCatalogs,
  })

  function handleEdit(catalog: Catalog) {
    setEditingCatalog(catalog)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
        <p className="text-muted-foreground">Manage your catalog collection</p>
      </div>
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Catalog
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <CatalogTable
        catalogs={catalogs}
        loading={isLoading}
        error={error}
        onEdit={handleEdit}
      />
      <CreateCatalogDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      <EditCatalogDialog
        open={!!editingCatalog}
        onOpenChange={(open) => !open && setEditingCatalog(null)}
        catalog={editingCatalog}
      />
    </div>
  )
}
