import { useState } from 'react'
import { Instagram, Trash2 } from 'lucide-react'
import type { GalleryImage } from '@/lib/api/gallery'
import { getImageUrl } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ImageCardProps {
  image: GalleryImage
  onClick: () => void
  onDelete: () => void
}

export function ImageCard({ image, onClick, onDelete }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <Card
        className="group relative overflow-hidden aspect-square cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-0 h-full">
          {hasError ? (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs p-2 text-center">
              Failed to load
            </div>
          ) : (
            <>
              {isLoading && (
                <Skeleton className="w-full h-full absolute inset-0" />
              )}
              <img
                src={getImageUrl(image.image)}
                alt={image.id}
                className={`
                  w-full h-full object-cover transition-transform duration-300
                  group-hover:scale-105 cursor-pointer
                  ${isLoading ? 'opacity-0' : 'opacity-100'}
                `}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />
              {image.type === 'instagram' && (
                <div className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full">
                  <Instagram className="w-3 h-3 text-white" />
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
