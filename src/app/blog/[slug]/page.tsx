import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogBody } from '@/components/blog-body';
import { POSTS, getPost, getRelated, formatPostDate } from '@/lib/blog';
import { SITE, pageMetadata, jsonLdScript } from '@/lib/seo';

/** Static params: posts are known at build time, so every article prerenders. */
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return pageMetadata({ title: 'Post not found', path: '/blog', noIndex: true });

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelated(slug);
  const url = `${SITE.url}/blog/${post.slug}`;

  // Article schema for rich results.
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.keywords.join(', '),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE.url}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return (
    <article className="container max-w-3xl py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd)} />

      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/blog">
          <ArrowLeft /> All resources
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge>{post.category}</Badge>
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" /> {post.readingMinutes} min read
        </span>
      </div>

      <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">{post.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>

      <hr className="my-8" />

      <BlogBody body={post.body} />

      <Card className="mt-12 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Keep 100% of what you earn</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            自由工作平台 charges 0% commission — no fees to apply, no cut of your invoice.
          </p>
          <Button asChild>
            <Link href="/register">
              Create a free account <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Keep reading</h2>
          <div className="mt-4 grid gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="block">
                <Card className="transition-colors hover:border-primary">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{r.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{r.excerpt}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
