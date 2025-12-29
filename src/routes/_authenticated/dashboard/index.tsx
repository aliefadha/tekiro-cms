import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  PanelTop,
} from 'lucide-react'
import { articleApi } from '@/lib/api/article'
import { catalogApi } from '@/lib/api/catalog'
import { categoryApi } from '@/lib/api/category'
import { cordlessApi } from '@/lib/api/cordless'
import { galleryApi } from '@/lib/api/gallery'
import { productApi } from '@/lib/api/product'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardPage,
})

type StatCardProps = {
  title: string
  count: number
  icon: React.ReactNode
  href: string
  variant?: 'default' | 'secondary' | 'outline'
}

function StatCard({
  title,
  count,
  icon,
  href,
  variant = 'default',
}: StatCardProps) {
  return (
    <Link to={href}>
      <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{count}</h3>
                <p className="text-sm text-muted-foreground">
                  {count === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#85E408]/10">
              {icon}
            </div>
          </div>
          <Badge variant={variant} className="mt-4 w-fit">
            View {title.toLowerCase()}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-6 w-24" />
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
  })

  const { data: catalogs = [], isLoading: catalogsLoading } = useQuery({
    queryKey: ['catalog'],
    queryFn: catalogApi.getCatalogs,
  })

  const { data: webImages = [], isLoading: webImagesLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: galleryApi.getWebGallery,
  })

  const { data: instagramImages = [], isLoading: instagramImagesLoading } =
    useQuery({
      queryKey: ['instagram'],
      queryFn: galleryApi.getInstagramGallery,
    })

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: articleApi.getArticles,
  })

  const { data: cordlessItems = [], isLoading: cordlessItemsLoading } =
    useQuery({
      queryKey: ['cordless'],
      queryFn: cordlessApi.getCordlessList,
    })

  const isLoading =
    categoriesLoading ||
    productsLoading ||
    catalogsLoading ||
    webImagesLoading ||
    instagramImagesLoading ||
    articlesLoading ||
    cordlessItemsLoading

  const totalGalleryImages = webImages.length + instagramImages.length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your content management
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Categories',
      count: categories.length,
      icon: <FolderTree className="h-6 w-6 text-[#85E408]" />,
      href: '/category',
    },
    {
      title: 'Products',
      count: products.length,
      icon: <Package className="h-6 w-6 text-[#85E408]" />,
      href: '/product',
    },
    {
      title: 'Catalogs',
      count: catalogs.length,
      icon: <PanelTop className="h-6 w-6 text-[#85E408]" />,
      href: '/catalogue',
    },
    {
      title: 'Gallery Images',
      count: totalGalleryImages,
      icon: <ImageIcon className="h-6 w-6 text-[#85E408]" />,
      href: '/gallery',
    },
    {
      title: 'Articles',
      count: articles.length,
      icon: <BookOpen className="h-6 w-6 text-[#85E408]" />,
      href: '/article',
    },
    {
      title: 'Cordless Items',
      count: cordlessItems.length,
      icon: <FileText className="h-6 w-6 text-[#85E408]" />,
      href: '/cordless',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your content management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-[#85E408]" />
          <Badge
            variant="outline"
            className="border-[#85E408]/20 text-[#85E408]"
          >
            {stats.reduce((sum, stat) => sum + stat.count, 0)} Total Items
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            count={stat.count}
            icon={stat.icon}
            href={stat.href}
            variant="outline"
          />
        ))}
      </div>

      <div className="rounded-xl border-2 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/category">
            <button className="w-full text-left p-4 rounded-lg border border-dashed hover:border-[#85E408] hover:bg-[#85E408]/5 transition-all">
              <p className="font-medium">Create Category</p>
              <p className="text-sm text-muted-foreground">
                Add a new category
              </p>
            </button>
          </Link>
          <Link to="/product">
            <button className="w-full text-left p-4 rounded-lg border border-dashed hover:border-[#85E408] hover:bg-[#85E408]/5 transition-all">
              <p className="font-medium">Add Product</p>
              <p className="text-sm text-muted-foreground">
                Create a new product
              </p>
            </button>
          </Link>
          <Link to="/article/create">
            <button className="w-full text-left p-4 rounded-lg border border-dashed hover:border-[#85E408] hover:bg-[#85E408]/5 transition-all">
              <p className="font-medium">Write Article</p>
              <p className="text-sm text-muted-foreground">
                Publish new content
              </p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
