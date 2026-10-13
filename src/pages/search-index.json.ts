import { getPublicPosts, postPath, tagPath } from '../utils/posts';

export async function GET() {
  const posts = await getPublicPosts();
  const tagsMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) tagsMap.set(tag, (tagsMap.get(tag) ?? 0) + 1);
  }
  const tags = [...tagsMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, url: tagPath(name) }));

  return new Response(JSON.stringify({
    posts: posts.map((post) => ({
      id: post.id,
      type: 'post',
      title: post.data.title,
      description: post.data.description,
      content: post.body ?? '',
      url: postPath(post.id),
      date: post.data.pubDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' }),
      tags: post.data.tags,
      category: post.data.category,
    })),
    tags,
  }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
