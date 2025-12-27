import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, FileText, Pen, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { articleApi } from '@/lib/api/article'
import { getImageUrl } from '@/lib/api-client'

export const Route = createFileRoute('/_authenticated/article/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: articles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['articles'],
    queryFn: articleApi.getArticles,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Articles</h1>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="p-8 text-center text-destructive">
          Failed to load articles. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Articles</h1>
        </div>
        <Link to="/article/create">
          <Button>
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Article</span>
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No articles found. Create your first article to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const isPublished = !!article.publishedAt
            return (
              <Link
                key={article.id}
                to="/article/$id"
                params={{ id: article.id }}
              >
                <Card className="overflow-hidden cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden relative group">
                      {article.primaryImage ? (
                        <img
                          src={getImageUrl(article.primaryImage)}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <CardHeader className="p-4 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={isPublished ? 'default' : 'secondary'}>
                          {isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        {article.publishedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.publishedAt).toLocaleDateString(
                              'en-GB',
                              {
                                year: 'numeric',
                                month: '2-digit',
                                day: 'numeric',
                              },
                            )}
                          </span>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.excerpt || 'No excerpt available.'}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter className="flex items-center justify-end p-4 pt-0">
                      <Link to="/article/$id" params={{ id: article.id }}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Pen className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </Link>
                    </CardFooter>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
