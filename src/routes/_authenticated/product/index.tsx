import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { productApi } from '@/lib/api/product'
import { ProductTable } from '@/components/product/product-table'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/product/')({
  component: ProductPage,
})

function ProductPage() {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product</h1>
        <p className="text-muted-foreground">Manage your products</p>
      </div>
      <div className="flex justify-end">
        <Link to="/product/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>
      <ProductTable products={products} loading={isLoading} error={error} />
    </div>
  )
}
