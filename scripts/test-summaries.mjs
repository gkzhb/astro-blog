import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { postSummary } from '../src/utils/summary.ts';

assert.equal(await postSummary('  手写摘要  ', '正文<!--more-->'), '手写摘要');
for (const marker of ['<!--more-->', '<!-- more -->', '<!-- MORE -->']) {
  assert.equal(await postSummary('', `简介 **重点** [链接](https://example.com)\n\n${marker}\n\n不要包含后文`), '简介 重点 链接');
}
assert.equal(await postSummary('', '# 标题\n\n正文 &amp; **重点**，使用 `git`。\n\n![图片](image.png)\n\n```js\n秘密代码\n```\n\n<!--more-->'), '标题 正文 & 重点，使用 git。');
assert.equal(await postSummary('', '[参考][ref]\n\n<!--more-->\n\n[ref]: https://example.com'), '参考');
assert.equal(await postSummary('', '前文\n\n```html\n<!--more-->\n```\n\n后文'), '前文 后文');
assert.equal(await postSummary('', '<!-- 注释 -->\n\n<script>不要显示</script>\n\n正常正文'), '正常正文');
assert.equal(await postSummary('', 'import Counter from "./Counter.jsx";\n\n简介\n\n<Counter />\n\n<!--more-->'), '简介');
assert.equal(await postSummary('', '数学 $x+y$\n\n$$\nx=y\n$$\n\n<!--more-->'), '数学');
assert.equal(await postSummary('', '中文🌱'.repeat(80)), `${Array.from('中文🌱'.repeat(80)).slice(0, 150).join('')}…`);
assert.equal(await postSummary('', '长'.repeat(180) + '\n\n<!--more-->'), '长'.repeat(180));
assert.equal(await postSummary('', '<!--more-->\n\n从正文回退'), '从正文回退');
assert.equal(await postSummary('', '```js\ncode\n```\n\n<!--more-->\n\n从正文回退'), '从正文回退');
assert.equal(await postSummary(undefined, undefined), '');
assert.equal(await postSummary(' ', '```js\ncodeOnly\n```'), '');

const source = await readFile(new URL('../src/content/posts/2021-3-dotfiles.md', import.meta.url), 'utf8');
const { frontmatter, content } = parseFrontmatter(source);
const summary = await postSummary(frontmatter.description, content);
assert.ok(summary.startsWith('之前一直比较头疼配置文件在多台设备上的备份与共享'));
assert.ok(summary.includes('Git 基本操作'));
assert.ok(!summary.includes('本方法主要思想'));

// Run with --built after building: the real card/filter/feed pipeline must agree.
if (process.argv.includes('--built')) {
  const read = (file) => readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
  for (const file of ['posts/index.html', 'index.html']) {
    const html = await read(file);
    const summaries = [...html.matchAll(/<p\b[^>]*class="card-desc"[^>]*>([\s\S]*?)<\/p>/g)].map((match) => match[1].trim());
    assert.ok(summaries.length > 0, `${file}: cards exist`);
    assert.ok(summaries.every(Boolean), `${file}: every public card has a summary`);
  }
  const index = JSON.parse(await read('search-index.json'));
  assert.ok(index.posts.every((post) => post.description.trim()), 'Search descriptions populated');
  assert.equal(index.posts.find((post) => post.id === '2021-3-dotfiles').description, summary);
  const rss = await read('rss.xml');
  const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  assert.ok(items.length > 0);
  assert.ok(items.every(([, item]) => /<description>[^<]+|<description><!\[CDATA\[.+?\]\]>/s.test(item)), 'RSS descriptions populated');
  const listing = await read('posts/index.html');
  assert.ok(!/data-description(?:\s|>)/.test(listing), 'List search gets summaries too');
}
console.log('Post summary priority, Markdown cleanup, more boundaries and Unicode truncation verified.');
