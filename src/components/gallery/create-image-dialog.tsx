import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { galleryApi } from '@/lib/api/gallery'
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

interface CreateImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateImageDialog({
  open,
  onOpenChange,
}: CreateImageDialogProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: galleryApi.createWebImage,
    onSuccess: () => {
      toast.success('Image uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['gallery', 'web'] })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image',
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
    setTitle('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) {
      toast.error('Please provide both title and image')
      return
    }
    createMutation.mutate({ title: title.trim(), file })
  }

  function handleClose() {
    setTitle('')
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
          <DialogTitle>Add to Web Gallery</DialogTitle>
          <DialogDescription>
            Upload a new image to your web gallery
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
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
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
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
              disabled={createMutation.isPending || !file || !title.trim()}
            >
              {createMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
