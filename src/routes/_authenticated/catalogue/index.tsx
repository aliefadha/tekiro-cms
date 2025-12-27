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

  const { data: categories = [] } = useQuery({
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
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create catalog',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.endsWith('.pdf')) {
        toast.error('Please select a PDF file')
        return
      }
      setFile(selectedFile)
    }
  }

  function handleRemoveFile() {
    setFile(null)
    setTitle('')
    setCategoryId('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !categoryId || !file) {
      toast.error('Please provide title, category, and file')
      return
    }
    createMutation.mutate({
      title: title.trim(),
      categoryId,
      file,
    })
  }

  function handleClose() {
    setTitle('')
    setCategoryId('')
    setFile(null)
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
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
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
                    id="file"
                    type="file"
                    accept=".pdf,application/pdf"
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

  const { data: categories = [] } = useQuery({
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
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update catalog',
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
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete catalog',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.endsWith('.pdf')) {
        toast.error('Please select a PDF file')
        return
      }
      setFile(selectedFile)
    }
  }

  function handleRemoveFile() {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!catalog || !title.trim() || !categoryId) {
      toast.error('Please provide title and category')
      return
    }
    updateMutation.mutate({
      id: catalog.id,
      title: title.trim(),
      categoryId,
      file: file || undefined,
    })
  }

  function handleClose() {
    setTitle('')
    setCategoryId('')
    setFile(null)
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
    }
  }, [open, catalog])

  return (
    <>
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
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
              <Label htmlFor="edit-file">Replace PDF (Optional)</Label>
              {file ? (
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-red-500" />
                  <span className="flex-1 text-sm">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
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
    </>
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
