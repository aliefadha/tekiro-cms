import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, PlusCircle } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export const Route = createFileRoute('/_authenticated/article/create')({
  component: CreateArticlePage,
})

function CreateArticlePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | undefined>()
  const [publishedAt, setPublishedAt] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')

  const createMutation = useMutation({
    mutationFn: articleApi.createArticle,
    onSuccess: (data) => {
      toast.success('Article created successfully')
      navigate({ to: '/article/$id', params: { id: data.id } })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create article',
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !excerpt.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    if (content.trim() === '' || content.trim() === '<p></p>') {
      toast.error('Please add content to your article')
      return
    }
    createMutation.mutate({
      title: title.trim(),
      excerpt: excerpt.trim(),
      contentHtml: content.trim(),
      file,
      publishedAt: publishedAt || null,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords: seoKeywords || undefined,
      metaTags:
        metaTitle || metaDescription || metaKeywords
          ? {
              title: metaTitle || undefined,
              description: metaDescription || undefined,
              keywords: metaKeywords || undefined,
            }
          : undefined,
    })
  }

  const handleCancel = () => {
    navigate({ to: '/article' })
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Article
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new article.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Article Details
          </CardTitle>
          <CardDescription>
            Enter the article information. All fields marked with * are
            required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
                required
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Brief summary of article"
                required
                disabled={createMutation.isPending}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your article content here..."
                className={
                  createMutation.isPending
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }
              />
              <p className="text-sm text-muted-foreground">
                Use the toolbar above to format your text
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Primary Image</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0])}
                disabled={createMutation.isPending}
              />
              {file && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title (optional)</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom title for SEO"
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description (optional)</Label>
              <textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                placeholder="Meta description for search engines"
                disabled={createMutation.isPending}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoKeywords">SEO Keywords (optional)</Label>
              <Input
                id="seoKeywords"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="Comma-separated keywords"
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Tag Title (optional)</Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="OpenGraph title"
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">
                Meta Tag Description (optional)
              </Label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder="OpenGraph description"
                disabled={createMutation.isPending}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Tag Keywords (optional)</Label>
              <Input
                id="metaKeywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="OpenGraph keywords"
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publish Date (optional)</Label>
              <Input
                id="publishedAt"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                disabled={createMutation.isPending}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to save as draft
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Article'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
