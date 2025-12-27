import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { getImageUrl } from '@/lib/api-client'
import { categoryApi } from '@/lib/api/category'
import { productApi } from '@/lib/api/product'
import { catalogApi } from '@/lib/api/catalog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/category/$id')({
  component: CategoryDetailPage,
})

function CategoryDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const {
    data: category,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getCategoryById(id),
    enabled: !!id,
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
    enabled: !!id,
  })

  const { data: catalogs = [] } = useQuery({
    queryKey: ['catalogs'],
    queryFn: catalogApi.getCatalogs,
    enabled: !!id,
  })

  const categoryProducts = products.filter((p) => p.categoryId === id)
  const categoryCatalogs = catalogs.filter((c) => c.categoryId === id)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load category. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Category Details</h1>
        <p className="text-muted-foreground">View category information</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">ID</p>
              <p className="font-mono text-sm">{category.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{category.name}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Image</p>
            <img
              src={getImageUrl(category.image)}
              alt={category.name}
              className="rounded-md max-w-xs object-cover"
            />
          </div>
        </CardContent>
      </Card>

      {categoryProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Products ({categoryProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate({ to: `/product/${product.id}` })}
                  className="group block cursor-pointer"
                >
                  <div className="rounded-lg border p-4 space-y-3 hover:border-primary transition-colors">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      {product.images.length > 0 && (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {categoryCatalogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Catalogues ({categoryCatalogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryCatalogs.map((catalog) => (
                <div
                  key={catalog.id}
                  onClick={() => navigate({ to: '/catalogue' })}
                  className="group block cursor-pointer"
                >
                  <div className="rounded-lg border p-4 space-y-3 hover:border-primary transition-colors">
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                        {catalog.title}
                        <ExternalLink className="h-3 w-3" />
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {categoryProducts.length === 0 && categoryCatalogs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No products or catalogues found for this category.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
