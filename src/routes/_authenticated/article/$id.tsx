import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { articleApi } from '@/lib/api/article'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArticleViewMode } from '@/components/article/article-view-mode'
import { ArticleEditMode } from '@/components/article/article-edit-mode'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/_authenticated/article/$id')({
  component: ArticleDetailPage,
})

function ArticleDetailPage() {
  const queryClient = useQueryClient()
  const { id } = Route.useParams()
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getArticleById(id),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: articleApi.updateArticle,
    onSuccess: () => {
      toast.success('Article updated successfully')
      queryClient.invalidateQueries({ queryKey: ['article', id] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setViewMode('view')
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update article',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: articleApi.deleteArticle,
    onSuccess: () => {
      toast.success('Article deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['article', id] })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setDeleteDialogOpen(false)
      window.history.back()
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete article',
      )
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load article. Please try again.
      </div>
    )
  }

  const isPublished = !!article.publishedAt

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {viewMode === 'view' ? 'Article Details' : 'Edit Article'}
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'view'
                ? 'View article information'
                : 'Edit article content'}
            </p>
          </div>
          {viewMode === 'view' ? (
            <div className="flex gap-2">
              <Button onClick={() => setViewMode('edit')} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode('view')}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const form = document.getElementById(
                    'edit-form',
                  ) as HTMLFormElement
                  form.dispatchEvent(
                    new Event('submit', { bubbles: true, cancelable: true }),
                  )
                }}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {article.title}
            <Badge variant={isPublished ? 'default' : 'secondary'}>
              {isPublished ? 'Published' : 'Draft'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {article.publishedAt
              ? `Published on ${new Date(
                  article.publishedAt,
                ).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`
              : 'Draft article'}
          </CardDescription>
        </CardHeader>

        {viewMode === 'view' ? (
          <CardContent className="space-y-6">
            <ArticleViewMode article={article} />
          </CardContent>
        ) : (
          <CardContent>
            <ArticleEditMode
              article={article}
              onCancel={() => setViewMode('view')}
              isPending={updateMutation.isPending}
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const formData = new FormData()

                const titleInput = form.querySelector(
                  '[name="title"]',
                ) as HTMLInputElement
                const excerptInput = form.querySelector(
                  '[name="excerpt"]',
                ) as HTMLInputElement
                const contentInput = form.querySelector(
                  '[name="content"]',
                ) as HTMLInputElement
                const fileInput = form.querySelector(
                  '[name="file"]',
                ) as HTMLInputElement

                if (!titleInput.value || !excerptInput.value) {
                  toast.error('Please fill in all required fields')
                  return
                }

                formData.append('title', titleInput.value)
                formData.append('excerpt', excerptInput.value)
                formData.append('contentHtml', contentInput.value)

                if (fileInput.files?.[0]) {
                  formData.append('file', fileInput.files[0])
                }

                updateMutation.mutate({
                  id: article.id,
                  title: titleInput.value,
                  excerpt: excerptInput.value,
                  contentHtml: contentInput.value,
                  file: fileInput.files?.[0] || undefined,
                })
              }}
            />
          </CardContent>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete article "{article.title}"? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate(article.id)
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
