import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';

// Run after `pnpm build`. Exercise the public contract of the migrated site,
// without a browser/server or access to the deployment credentials.
const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const exists = async (file) => {
  // Vite emits Unicode/space directory names literally, not URL-encoded.
  await access(new URL(encodeURI(file).replace(/#/g, '%23').replace(/\?/g, '%3F'), root));
};
const html = async (route) => {
  const file = `dist/${route ? `${route}/` : ''}index.html`;
  await exists(file);
  return readFile(new URL(encodeURI(file).replace(/#/g, '%23').replace(/\?/g, '%3F'), root), 'utf8');
};
const metadata = (source) => source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
const flag = (front, name) => new RegExp(`^${name}:\\s*true\\s*(?:#.*)?$`, 'm').test(front);
const files = (await readdir(new URL('src/content/posts/', root))).filter((name) => /\.(md|mdx)$/.test(name));
const posts = await Promise.all(files.map(async (file) => {
  const front = metadata(await read(`src/content/posts/${file}`));
  return {
    id: file.replace(/\.(md|mdx)$/, ''),
    draft: flag(front, 'draft'),
    hidden: flag(front, 'hidden') || flag(front, 'hiddenFromHomePage'),
    category: front.match(/^category:\s*["']?([^\r\n"']+)["']?\s*$/m)?.[1]?.trim(),
    mdx: file.endsWith('.mdx'),
  };
}));
const published = posts.filter((p) => !p.draft);
const discoverable = published.filter((p) => !p.hidden);
const configSource = await read('src/config/site.ts');
const siteUrl = process.env.SITE_URL || configSource.match(/https:\/\/blog\.gkzhb\.top\/?/)?.[0];
assert.ok(siteUrl, 'Expected a configured production site URL');
const site = new URL(siteUrl);

const rss = await read('dist/rss.xml');
const index = JSON.parse(await read('dist/search-index.json'));
const searchIds = index.posts.map((post) => post.id).sort();
assert.deepEqual(searchIds, discoverable.map((p) => p.id).sort(), 'Search must include public posts only');
assert.equal((rss.match(/<item>/g) ?? []).length, discoverable.length, 'RSS public article count');
assert.ok(rss.includes(site.hostname), 'RSS production domain');
assert.ok(!rss.includes('minrock.vercel.app'), 'RSS must not point to the demo');

for (const post of published) {
  const page = await html(`posts/${post.id}`);
  assert.ok(page.includes('<h1'), `Article heading: ${post.id}`);
  assert.ok(page.includes('site-footer'), `Global footer: ${post.id}`);
  const canonical = page.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]
    ?? page.match(/<link\b[^>]*href="([^"]+)"[^>]*rel="canonical"/)?.[1];
  assert.ok(canonical, `Canonical present: ${post.id}`);
  assert.equal(new URL(canonical).origin, site.origin, `Canonical origin: ${post.id}`);
  assert.equal(new URL(canonical).pathname.replace(/\/$/, ''), `/posts/${post.id}`, `Preserved canonical route: ${post.id}`);
  const redirect = await html(`post/${post.id}`);
  assert.ok(/http-equiv="refresh"/i.test(redirect), `Static Hugo redirect: ${post.id}`);
  assert.ok(redirect.includes(`/posts/${post.id}`), `Hugo redirect target: ${post.id}`);
}
for (const post of posts.filter((p) => p.draft)) {
  for (const route of ['posts', 'post']) {
    await assert.rejects(() => exists(`dist/${route}/${post.id}/index.html`), `Draft route leaked: ${route}/${post.id}`);
  }
  assert.ok(!rss.includes(`/posts/${post.id}/`), `Draft in RSS: ${post.id}`);
}
for (const post of index.posts) {
  assert.equal(post.url.replace(/\/$/, ''), `/posts/${post.id}`, `Search URL: ${post.id}`);
  for (const tag of post.tags) await html(`tags/${tag}`);
}
for (const category of new Set(discoverable.map((p) => p.category).filter(Boolean))) {
  await html(`categories/${category}`);
}
for (const route of ['', 'posts', 'about', 'tags', 'categories', 'search']) {
  const page = await html(route);
  assert.ok(page.includes('site-footer'), `Global footer: ${route || '/'}`);
  assert.ok(!page.includes('scatter-leaf'), `Disabled demo comments: ${route || '/'}`);
}
const home = await html('');
assert.ok(home.includes('roam.gkzhb.top'), 'Knowledge garden link');
assert.ok(home.includes('github.com/gkzhb'), 'Personal GitHub link');
assert.ok(!home.includes('Renato Rezende'), 'No demo author on home');
assert.ok(home.includes('creativecommons.org/licenses/by/4.0'), 'Preserved CC-BY-4.0 content license');
for (const tag of ['linux', 'blog']) {
  const expected = index.posts.filter((post) => post.tags.includes(tag)).length;
  if (!expected) continue;
  const tagPage = await html(`tags/${tag}`);
  assert.ok(tagPage.includes(`共 ${expected} 篇文章`), `Case variants must not overwrite ${tag} articles`);
}
await exists('dist/CNAME');
await exists('dist/404.html');
await exists('dist/sitemap-index.xml');
const sitemapFiles = (await readdir(new URL('dist/', root))).filter((name) => /^sitemap-\d+\.xml$/.test(name));
const sitemap = (await Promise.all(sitemapFiles.map((name) => read(`dist/${name}`)))).join('');
assert.ok(!sitemap.includes(`${site.origin}/post/`), 'No legacy aliases in sitemap');
assert.ok(!sitemap.includes(`${site.origin}/blog/`), 'No theme aliases in sitemap');
for (const post of published.filter((p) => p.hidden)) {
  assert.ok(!sitemap.includes(`/posts/${post.id}/`), `Hidden article in sitemap: ${post.id}`);
  assert.ok(!rss.includes(`/posts/${post.id}/`), `Hidden article in RSS: ${post.id}`);
}
await exists('dist/robots.txt');

// Existing math and MDX React are migration-sensitive; guard their rendering.
if (files.includes('my-post.md')) assert.ok((await html('posts/my-post')).includes('katex'), 'Math rendering');
if (files.includes('2022-01-02-ssg-ssr.mdx')) {
  const counter = await html('posts/2022-01-02-ssg-ssr');
  assert.ok(counter.includes('astro-island'), 'Hydrated React island');
  assert.ok(counter.includes('>inc</button>'), 'Original MDX Counter content');
}
// Resolve every internal HTML link against static output. This also catches
// Unicode/space path encoding mistakes that a successful build alone misses.
const walk = async (directory) => {
  const entries = await readdir(new URL(`${directory}/`, root), { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? walk(`${directory}/${entry.name}`)
    : [`${directory}/${entry.name}`]));
  return nested.flat();
};
const outputFiles = await walk('dist');
const outputSet = new Set(outputFiles);
for (const file of outputFiles.filter((file) => file.endsWith('.html'))) {
  const source = await readFile(new URL(encodeURI(file), root), 'utf8');
  for (const [, href] of source.matchAll(/<a\b[^>]*\bhref="([^"#]+)"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const pathname = decodeURIComponent(new URL(href.replace(/&amp;/g, '&'), site).pathname);
    const destination = `dist${pathname}`.replace(/\/$/, '');
    // Old tag aliases differ only in case. A case-insensitive local filesystem
    // contains a single directory; Linux CI verifies both emitted directories.
    try { await exists(outputSet.has(destination) ? destination : `${destination}/index.html`); }
    catch { assert.fail(`Broken internal link ${href} in ${file}`); }
  }
}
console.log(`Migration verified: ${published.length} published posts, ${posts.length - published.length} drafts excluded; preserved URLs, RSS/search, categories/tags, footer, math and MDX.`);
