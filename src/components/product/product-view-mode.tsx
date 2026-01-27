import { getImageUrl } from '@/lib/api-client'

interface ProductViewModeProps {
  product: {
    id: string
    name: string
    description: string
    storeUrl: string | null
    category: {
      name: string
    }
    images: Array<string>
  }
}

function formatDescription(description: string) {
  const lines = description.split('\n').filter((line) => line.trim())
  if (lines.length === 0) return null
  return (
    <ul className="list-disc list-inside space-y-1 text-sm">
      {lines.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  )
}

export function ProductViewMode({ product }: ProductViewModeProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">ID</p>
          <p className="font-mono text-sm">{product.id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Name</p>
          <p className="font-medium">{product.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Category</p>
          <p className="font-medium">{product.category.name}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Description</p>
        {formatDescription(product.description)}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Images</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.images.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden border"
            >
              <img
                src={getImageUrl(image)}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
