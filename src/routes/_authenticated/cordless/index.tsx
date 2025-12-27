import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { CordlessItem } from '@/lib/api/cordless'
import { cordlessApi } from '@/lib/api/cordless'
import { CordlessTable } from '@/components/cordless/cordless-table'
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

export const Route = createFileRoute('/_authenticated/cordless/')({
  component: CordlessPage,
})

function CreateCordlessDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')

  const createMutation = useMutation({
    mutationFn: cordlessApi.createCordless,
    onSuccess: () => {
      toast.success('Cordless item created successfully')
      queryClient.invalidateQueries({ queryKey: ['cordless'] })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create cordless item',
      )
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !link.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
    })
  }

  function handleClose() {
    setTitle('')
    setDescription('')
    setLink('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Cordless Item</DialogTitle>
          <DialogDescription>
            Add a new cordless item to your collection
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              required
            />
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
                !description.trim() ||
                !link.trim()
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

function EditCordlessDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CordlessItem | null
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')

  const updateMutation = useMutation({
    mutationFn: cordlessApi.updateCordless,
    onSuccess: () => {
      toast.success('Cordless item updated successfully')
      queryClient.invalidateQueries({ queryKey: ['cordless'] })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update cordless item',
      )
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!item || !title.trim() || !description.trim() || !link.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    updateMutation.mutate({
      id: item.id,
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
    })
  }

  function handleClose() {
    setTitle('')
    setDescription('')
    setLink('')
    onOpenChange(false)
  }

  function populateForm() {
    if (!item) return
    setTitle(item.title)
    setDescription(item.description)
    setLink(item.link)
  }

  useEffect(() => {
    if (open && item) {
      populateForm()
    }
  }, [open, item])

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cordless Item</DialogTitle>
            <DialogDescription>
              Update cordless item details or delete it
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link">Link</Label>
              <Input
                id="edit-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                required
              />
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

function CordlessPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CordlessItem | null>(null)

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cordless'],
    queryFn: cordlessApi.getCordlessList,
  })

  function handleEdit(item: CordlessItem) {
    setEditingItem(item)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cordless</h1>
        <p className="text-muted-foreground">Manage your cordless collection</p>
      </div>
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <CordlessTable
        items={items}
        loading={isLoading}
        error={error}
        onEdit={handleEdit}
      />
      <CreateCordlessDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      <EditCordlessDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
      />
    </div>
  )
}
