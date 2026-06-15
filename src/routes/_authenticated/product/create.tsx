import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { productApi } from '@/lib/api/product'
import { categoryApi } from '@/lib/api/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/_authenticated/product/create')({
  component: CreateProductPage,
})

function CreateProductPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<Array<File>>([])
  const [previews, setPreviews] = useState<Array<string>>([])

  const [categoryId, setCategoryId] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      toast.success('Product created successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      router.history.back()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create product',
      )
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/'),
    )

    if (validFiles.length < selectedFiles.length) {
      toast.error('Some files were not images and were skipped')
    }

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

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !description.trim() || !categoryId) {
      toast.error('Please provide name, description, and category')
      return
    }
    if (files.length === 0) {
      toast.error('Please upload at least one image')
      return
    }
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      files,

      categoryId,
    })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your collection
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
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
          <Label htmlFor="files">Images</Label>
          <Input
            ref={fileInputRef}
            id="files"
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
                    onClick={() => handleRemoveFile(index)}
                  >
                    <span className="sr-only">Remove image</span>×
                  </Button>
                </div>
              ))}
              <div className="aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center relative z-10 pointer-events-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="relative z-20"
                  onClick={() =>
                    fileInputRef.current?.dispatchEvent(
                      new MouseEvent('click', { bubbles: true }),
                    )
                  }
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
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.history.back()}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}
