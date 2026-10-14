import { getCollection, type CollectionEntry } from 'astro:content';
import { postSummary } from './summary';

/** Resolve once at the data boundary so cards, filters, SEO and feeds agree. */
async function withSummary(post: CollectionEntry<'blog'>): Promise<CollectionEntry<'blog'>> {
  return {
    ...post,
    data: { ...post.data, description: await postSummary(post.data.description, post.body) },
  };
}

/** Discovery boundary used by listings and machine-readable feeds. */
export function isPublicPost({ data }: CollectionEntry<'blog'>): boolean {
  return !data.draft && !data.hidden;
}

/** Unlisted (hidden) posts retain their direct links; drafts never get pages. */
export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return (await Promise.all(posts.map(withSummary)))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
}

export async function getPublicPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', isPublicPost);
  return (await Promise.all(posts.map(withSummary)))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
}

export function postPath(id: string): string {
  return `/posts/${id.split('/').map(encodeURIComponent).join('/')}/`;
}

export function tagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}/`;
}

export function categoryPath(category: string): string {
  return `/categories/${encodeURIComponent(category)}/`;
}

/** Mixed-language estimate: Chinese characters / 400 + Latin words / 200. */
export function readingMinutes(markdown: string): number {
  const text = markdown.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '').replace(/<[^>]+>/g, '');
  const cjk = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  const words = text.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, ' ')
    .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(cjk / 400 + words / 200));
}
