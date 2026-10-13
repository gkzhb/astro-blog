import { readFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeCallouts } from './src/plugins/rehype-callouts.mjs';
import { siteConfig } from './src/config/site';

export default defineConfig({
  site: siteConfig.siteUrl,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    react(),
    sitemap({
      // Static redirect pages are compatibility aliases, not canonical articles.
      filter: (url) => !/^\/(?:post|blog)(?:\/|$)/.test(new URL(url).pathname)
        && !/^\/tags\/(?:Linux|Blog)\/$/.test(new URL(url).pathname),
      async serialize(item) {
        // Unlisted article pages exist for direct links, not search discovery.
        const pathname = new URL(item.url).pathname.replace(/\/?$/, '/');
        const file = new URL(`./dist${pathname}index.html`, import.meta.url);
        const html = await readFile(file, 'utf8');
        return /<meta\b[^>]*name="robots"[^>]*content="noindex/.test(html) ? undefined : item;
      },
    }),
  ],
  redirects: { '/blog': '/posts/' },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  markdown: {
    // Explicit unified pipeline: Satteri is Astro 7's default, but the existing
    // articles need remark-math/rehype-katex (also inherited by MDX).
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeCallouts],
    }),
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
