interface ArticleContentProps {
  contentHtml: string | null | undefined
}

export function ArticleContent({ contentHtml }: ArticleContentProps) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-3">Content</p>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div
          className="article-content p-6 space-y-5"
          dangerouslySetInnerHTML={{
            __html:
              contentHtml ||
              '<p class="text-muted-foreground italic">No content available.</p>',
          }}
          style={
            {
              '--tw-prose-body': 'var(--foreground)',
              '--tw-prose-headings': 'var(--foreground)',
              '--tw-prose-links': 'hsl(var(--primary))',
              '--tw-prose-bold': 'var(--foreground)',
              '--tw-prose-counters': 'var(--muted-foreground)',
              '--tw-prose-bullets': 'var(--muted-foreground)',
              '--tw-prose-hr': 'var(--border)',
              '--tw-prose-quotes': 'var(--foreground)',
              '--tw-prose-quote-borders': 'var(--border)',
              '--tw-prose-captions': 'var(--muted-foreground)',
              '--tw-prose-code': 'var(--foreground)',
              '--tw-prose-pre-code': 'var(--foreground)',
              '--tw-prose-pre-bg': 'var(--muted)',
              '--tw-prose-th-borders': 'var(--border)',
              '--tw-prose-td-borders': 'var(--border)',
            } as React.CSSProperties
          }
        />
      </div>
      <style>{`
        .article-content h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin-bottom: 1rem; color: var(--foreground); letter-spacing: -0.025em; }
        .article-content h2 { font-size: 1.5rem; font-weight: 600; line-height: 1.3; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--foreground); letter-spacing: -0.025em; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
        .article-content h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--foreground); }
        .article-content h4 { font-size: 1.125rem; font-weight: 600; line-height: 1.4; margin-top: 1.25rem; margin-bottom: 0.5rem; color: var(--foreground); }
        .article-content h5 { font-size: 1rem; font-weight: 600; line-height: 1.5; margin-top: 1rem; margin-bottom: 0.5rem; color: var(--foreground); }
        .article-content h6 { font-size: 0.875rem; font-weight: 600; line-height: 1.5; margin-top: 1rem; margin-bottom: 0.5rem; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; }
        .article-content p { font-size: 0.9375rem; line-height: 1.7; margin-bottom: 1rem; color: var(--foreground); }
        .article-content a { color: hsl(var(--primary)); text-decoration: none; font-weight: 500; transition: all 0.2s; border-bottom: 1px solid transparent; }
        .article-content a:hover { text-decoration: underline; border-bottom-color: hsl(var(--primary)); }
        .article-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .article-content ul li { font-size: 0.9375rem; line-height: 1.7; margin-bottom: 0.5rem; color: var(--foreground); position: relative; }
        .article-content ul li::marker { color: hsl(var(--primary)); }
        .article-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; counter-reset: list-counter; }
        .article-content ol li { font-size: 0.9375rem; line-height: 1.7; margin-bottom: 0.5rem; color: var(--foreground); counter-increment: list-counter; }
        .article-content ol li::marker { font-weight: 500; color: hsl(var(--primary)); }
        .article-content blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; margin: 1rem 0; font-style: italic; color: var(--muted-foreground); background: var(--muted); border-radius: 0 0.375rem 0.375rem 0; padding: 0.75rem 1rem; }
        .article-content code { background: var(--muted); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8125rem; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; color: hsl(var(--primary)); }
        .article-content pre { background: var(--muted); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; border: 1px solid var(--border); }
        .article-content pre code { background: transparent; padding: 0; color: var(--foreground); font-size: 0.8125rem; line-height: 1.6; }
        .article-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9375rem; }
        .article-content th { background: var(--muted); font-weight: 600; text-align: left; padding: 0.75rem 1rem; border: 1px solid var(--border); color: var(--foreground); }
        .article-content td { padding: 0.75rem 1rem; border: 1px solid var(--border); color: var(--foreground); }
        .article-content tr:nth-child(even) { background: var(--muted/30); }
        .article-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        .article-content hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
        .article-content strong { font-weight: 600; color: var(--foreground); }
        .article-content em { font-style: italic; color: var(--muted-foreground); }
        .article-content del { text-decoration: line-through; color: var(--muted-foreground); }
        .article-content .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1rem 0; border-radius: 0.5rem; }
        .article-content .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .article-content .embed-responsive { margin: 1rem 0; }
      `}</style>
    </div>
  )
}
