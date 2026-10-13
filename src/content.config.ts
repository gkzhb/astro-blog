import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Keep the original filenames as IDs: no automatic slugification or moves.
const generateId = ({ entry }: { entry: string }) =>
  entry.replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId,
    deferRender: true,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    published: z.coerce.date().optional(),
    pubDate: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    tages: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false),
    hiddenFromHomePage: z.boolean().default(false),
    toc: z.boolean().default(true),
    image: z.string().or(z.object({ skip: z.string() })).optional(),
  }).transform((data, ctx) => {
    const pubDate = data.pubDate ?? data.published;
    if (!pubDate) {
      ctx.addIssue({ code: 'custom', message: 'A published or pubDate date is required.' });
      return z.NEVER;
    }
    return {
      ...data,
      pubDate,
      updatedDate: data.updatedDate ?? data.updated,
      tags: [...new Set([...(data.tags ?? []), ...(data.tages ?? [])].map((tag) =>
        /^(linux|blog)$/i.test(tag) ? tag.toLowerCase() : tag))],
      hidden: data.hidden || data.hiddenFromHomePage,
      image: typeof data.image === 'string' ? data.image : data.image?.skip,
    };
  }),
});

const specials = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/specials',
    generateId,
    deferRender: true,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    hidden: z.boolean().default(false),
    disabled: z.boolean().default(false),
  }),
});

export const collections = { blog, specials };
