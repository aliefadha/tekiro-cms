import { createFileRoute } from '@tanstack/react-router'
import { GalleryGrid } from '@/components/gallery/gallery-grid'

export const Route = createFileRoute('/_authenticated/gallery/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
        <p className="text-muted-foreground">
          Manage your Instagram and web gallery images
        </p>
      </div>
      <GalleryGrid />
    </div>
  )
}
