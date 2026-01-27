import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Category } from '@/lib/api/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getImageUrl } from '@/lib/api-client'

interface ProductEditModeProps {
  product: {
    id: string
    name: string
    description: string
    storeUrl: string | null
    categoryId: string
    images: Array<string>
  }
  categories: Array<Category>
  onCancel: () => void
  isPending: boolean
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    files: Array<File>,
    imagesToDelete: Array<string>,
  ) => void
}

export function ProductEditMode({
  product,
  categories,
  onCancel,
  isPending,
  onSubmit,
}: ProductEditModeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<Array<File>>([])
  const [previews, setPreviews] = useState<Array<string>>([])
  const [removedImageIndices, setRemovedImageIndices] = useState<Array<number>>(
    [],
  )
  const [imagesToDelete, setImagesToDelete] = useState<Array<string>>([])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/'),
    )

    if (validFiles.length === 0) return

    setFiles((prev) => [...prev, ...validFiles])

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () =>
        setPreviews((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleRemoveNewFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function handleRemoveExistingImage(index: number) {
    setRemovedImageIndices((prev) => [...prev, index])
    setImagesToDelete((prev) => [...prev, product.images[index]])
  }

  function handleUndoRemoveImage(index: number) {
    setRemovedImageIndices((prev) => prev.filter((i) => i !== index))
    setImagesToDelete((prev) =>
      prev.filter((img) => img !== product.images[index]),
    )
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit(e, files, imagesToDelete)
  }

  return (
    <form id="edit-form" onSubmit={handleFormSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name *</Label>
          <Input
            id="edit-name"
            name="name"
            defaultValue={product.name}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Description *</Label>
          <textarea
            id="edit-description"
            name="description"
            defaultValue={product.description}
            rows={4}
            required
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-category">Category *</Label>
          <select
            id="edit-category"
            name="categoryId"
            defaultValue={product.categoryId}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Images</Label>

          {product.images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Current Images:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => {
                  const isRemoved = removedImageIndices.includes(index)
                  return (
                    <div
                      key={index}
                      className={`relative aspect-square w-full rounded-lg overflow-hidden border group ${
                        isRemoved ? 'opacity-40' : ''
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Current ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isRemoved ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-100"
                          onClick={() => handleUndoRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Undo remove</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Hidden file input - always in DOM so ref works */}
          <Input
            ref={fileInputRef}
            id="edit-files"
            name="newFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

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
                    onClick={() => handleRemoveNewFile(index)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove image</span>
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

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  )
}
