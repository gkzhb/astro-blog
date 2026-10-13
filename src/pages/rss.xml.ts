import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublicPosts, postPath } from '../utils/posts';
import { siteConfig } from '../config/site';

export async function GET(context: APIContext) {
  const sortedPosts = await getPublicPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site || siteConfig.siteUrl,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: postPath(post.id)
    })),
    customData: `<language>zh-cn</language>`
  });
}
