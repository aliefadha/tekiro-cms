import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2, Upload } from 'lucide-react'
import type { ArticleImage } from '@/lib/api/article-image'
import { articleImageApi } from '@/lib/api/article-image'
import { getImageUrl } from '@/lib/api-client'
import { isImageUsedInContent } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface ImagePickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (imageUrl: string) => void
  currentContent?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function ImagePickerDialog({
  isOpen,
  onClose,
  onInsert,
  currentContent,
}: ImagePickerDialogProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<ArticleImage | null>(null)
  const [selectedImage, setSelectedImage] = useState<ArticleImage | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<ArticleImage | null>(null)

  const {
    data: galleryImages = [],
    isLoading: isLoadingGallery,
    error: galleryError,
  } = useQuery({
    queryKey: ['article-images'],
    queryFn: articleImageApi.getArticleImages,
    enabled: activeTab === 'gallery',
  })

  const uploadMutation = useMutation({
    mutationFn: articleImageApi.uploadArticleImage,
    onSuccess: (data) => {
      toast.success('Image uploaded successfully')
      setUploadedImage(data)
      queryClient.invalidateQueries({ queryKey: ['article-images'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: articleImageApi.deleteArticleImage,
    onSuccess: () => {
      toast.success('Image deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['article-images'] })
      setShowDeleteConfirm(false)
      if (selectedImage?.id === imageToDelete?.id) {
        setSelectedImage(null)
      }
      setImageToDelete(null)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete image',
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
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 5MB')
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
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleUpload() {
    if (!file) {
      toast.error('Please select an image file')
      return
    }
    uploadMutation.mutate(file)
  }

  function handleImageClick(image: ArticleImage) {
    setSelectedImage(image)
    setUploadedImage(null)
  }

  function handleDeleteClick(e: React.MouseEvent, image: ArticleImage) {
    e.stopPropagation()
    setImageToDelete(image)
    setShowDeleteConfirm(true)
  }

  function handleConfirmDelete() {
    if (imageToDelete) {
      deleteMutation.mutate(imageToDelete.id)
    }
  }

  function handleInsert() {
    const imageToInsert = uploadedImage || selectedImage
    if (imageToInsert) {
      onInsert(getImageUrl(imageToInsert.url))
      handleClose()
    }
  }

  function handleClose() {
    setFile(null)
    setPreview(null)
    setUploadedImage(null)
    setSelectedImage(null)
    setShowDeleteConfirm(false)
    setImageToDelete(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const isImageUsed =
    imageToDelete && currentContent
      ? isImageUsedInContent(imageToDelete.url, currentContent)
      : false

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Upload a new image or select from your gallery
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'upload' | 'gallery')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                Gallery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-file">Select Image</Label>
                {preview ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {!uploadedImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveFile}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop (Max 5MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        id="image-file"
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
                        disabled={uploadMutation.isPending}
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {!uploadedImage && file && (
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              {galleryError ? (
                <div className="p-8 text-center text-destructive">
                  Failed to load images. Please try again.
                </div>
              ) : isLoadingGallery ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No images found. Upload your first image to get started.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleImageClick(image)}
                      className={`
                        relative aspect-square rounded-lg overflow-hidden border cursor-pointer
                        transition-all hover:scale-105
                        ${selectedImage?.id === image.id ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      <img
                        src={getImageUrl(image.url)}
                        alt={image.id}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteClick(e, image)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending || deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsert}
              disabled={
                (!uploadedImage && !selectedImage) ||
                uploadMutation.isPending ||
                deleteMutation.isPending
              }
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              {isImageUsed
                ? 'This image is used in your article content. Are you sure you want to delete it?'
                : 'Are you sure you want to delete this image? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
