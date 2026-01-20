import { ExternalLink } from 'lucide-react'
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
        {product.storeUrl && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Store URL</p>
            <a
              href={product.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              Visit Store
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Description</p>
        <p className="text-sm">{product.description}</p>
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
