import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link as LinkIcon, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import type { GalleryImage } from '@/lib/api/gallery'
import { galleryApi } from '@/lib/api/gallery'
import { getImageUrl } from '@/lib/api-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImagePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: GalleryImage | null
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  image,
}: ImagePreviewDialogProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(true)

  const isInstagram = image?.type === 'instagram'

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isInstagram) {
        return galleryApi.updateInstagramImage(data)
      }
      return galleryApi.updateWebImage(data)
    },
    onSuccess: () => {
      toast.success('Image updated successfully')
      queryClient.invalidateQueries({
        queryKey: ['gallery', isInstagram ? 'instagram' : 'web'],
      })
      handleClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update image',
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
    if (!image || !title.trim()) {
      toast.error('Please provide a title')
      return
    }

    if (isInstagram && !link.trim()) {
      toast.error('Please provide a link')
      return
    }

    if (isInstagram) {
      updateMutation.mutate({
        id: image.id,
        title: title.trim(),
        link: link.trim(),
        file: file || undefined,
      })
    } else {
      updateMutation.mutate({
        id: image.id,
        title: title.trim(),
        file: file || undefined,
      })
    }
  }

  function handleClose() {
    setTitle('')
    setLink('')
    setFile(null)
    setPreview(null)
    setImageLoaded(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  function populateState() {
    if (!image) return
    setTitle(image.title)
    if (isInstagram) {
      setLink((image as any).link)
    }
  }

  useEffect(() => {
    if (open && image) {
      populateState()
    }
  }, [open, image])

  if (!image) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Update image details or delete it from your gallery
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="shrink-0 w-1/3">
                {preview || imageLoaded ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={preview || getImageUrl(image.image)}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={() => setImageLoaded(false)}
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                        Failed to load
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
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
                {isInstagram && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-link">Link</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="edit-link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://instagram.com/p/..."
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                )}
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
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
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
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
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
