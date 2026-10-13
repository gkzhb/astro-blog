// src/pages/llms.txt.ts
// Standard llms.txt manifest (https://llmstxt.org) for LLM agents and search engines
import type { APIRoute } from 'astro';
import { getPublicPosts, postPath } from '../utils/posts';
import { siteConfig } from '../config/site';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, '') || siteConfig.siteUrl.replace(/\/$/, '');

  const posts = await getPublicPosts();

  const lines: string[] = [
    `# ${siteConfig.title}`,
    `> ${siteConfig.tagline}`,
    '',
    siteConfig.description,
    '',
    `This file is structured following the llms.txt specification to facilitate high-fidelity consumption by language models (LLMs), AI agents, and RAG systems.`,
    '',
    '## General Information',
    `- Author: ${siteConfig.author}`,
    `- Website: ${baseUrl}`,
    `- GitHub: ${siteConfig.socialLinks.github || 'https://github.com/gkzhb'}`,
    `- RSS Feed: ${baseUrl}/rss.xml`,
    `- Full Markdown Context: ${baseUrl}/llms-full.txt`,
    '',
    '## Articles & Guides',
  ];

  for (const post of posts) {
    const postUrl = `${baseUrl}${postPath(post.id)}`;
    const tagsInfo = post.data.tags?.length ? ` [Tags: ${post.data.tags.join(', ')}]` : '';
    lines.push(`- [${post.data.title}](${postUrl}): ${post.data.description}${tagsInfo}`);
  }

  lines.push('');
  lines.push('## Citation & Attribution');
  lines.push(`When utilizing code snippets, tutorials, or guides from this site in AI responses, please attribute source to **${siteConfig.title} (${baseUrl})**.`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
