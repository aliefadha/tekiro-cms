import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Globe, Instagram, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ImageCard } from './image-card'
import { CreateImageDialog } from './create-image-dialog'
import { CreateInstagramDialog } from './create-instagram-dialog'
import { ImagePreviewDialog } from './image-preview-dialog'
import type { GalleryImage } from '@/lib/api/gallery'
import { galleryApi } from '@/lib/api/gallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'

const IMAGE_GRID_CLASSES =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'

interface GalleryGridProps {
  className?: string
}

export function GalleryGrid({ className }: GalleryGridProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'instagram' | 'web'>('instagram')
  const [isWebDialogOpen, setIsWebDialogOpen] = useState(false)
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const {
    data: instagramImages = [],
    isLoading: instagramLoading,
    error: instagramError,
  } = useQuery({
    queryKey: ['gallery', 'instagram'],
    queryFn: galleryApi.getInstagramGallery,
  })

  const {
    data: webImages = [],
    isLoading: webLoading,
    error: webError,
  } = useQuery({
    queryKey: ['gallery', 'web'],
    queryFn: galleryApi.getWebGallery,
  })

  const deleteWebMutation = useMutation({
    mutationFn: galleryApi.deleteWebImage,
    onSuccess: () => {
      toast.success('Image deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['gallery', 'web'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete image',
      )
    },
  })

  const deleteInstagramMutation = useMutation({
    mutationFn: galleryApi.deleteInstagramImage,
    onSuccess: () => {
      toast.success('Image deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['gallery', 'instagram'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete image',
      )
    },
  })

  function renderGrid(
    images: Array<GalleryImage>,
    isLoading: boolean,
    error?: unknown,
    onDelete?: (id: string) => void,
  ) {
    if (error) {
      return (
        <div className="p-8 text-center text-destructive">
          Failed to load images. Please try again.
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className={IMAGE_GRID_CLASSES}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      )
    }

    if (images.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          No images found.
        </div>
      )
    }

    return (
      <div className={IMAGE_GRID_CLASSES}>
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => setSelectedImage(image)}
            onDelete={onDelete ? () => onDelete(image.id) : () => {}}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'instagram' | 'web')}
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="instagram" className="gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="web" className="gap-2">
              <Globe className="w-4 h-4" />
              Web Gallery
            </TabsTrigger>
          </TabsList>
          {activeTab === 'instagram' && (
            <Dialog
              open={isInstagramDialogOpen}
              onOpenChange={setIsInstagramDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Image
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
          {activeTab === 'web' && (
            <Dialog open={isWebDialogOpen} onOpenChange={setIsWebDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Image
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>

        <TabsContent value="instagram" className="mt-0">
          {renderGrid(
            instagramImages,
            instagramLoading,
            instagramError,
            deleteInstagramMutation.mutate,
          )}
        </TabsContent>

        <TabsContent value="web" className="mt-0">
          {renderGrid(
            webImages,
            webLoading,
            webError,
            deleteWebMutation.mutate,
          )}
        </TabsContent>
      </Tabs>

      <CreateImageDialog
        open={isWebDialogOpen}
        onOpenChange={setIsWebDialogOpen}
      />
      <CreateInstagramDialog
        open={isInstagramDialogOpen}
        onOpenChange={setIsInstagramDialogOpen}
      />
      <ImagePreviewDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        image={selectedImage}
      />
    </div>
  )
}
