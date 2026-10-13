import assert from 'node:assert/strict';
import { rehypeCallouts } from '../src/plugins/rehype-callouts.mjs';

const blockquote = (text) => ({
  type: 'element', tagName: 'blockquote', properties: {}, children: [
    { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: text }] },
  ],
});
const tree = { type: 'root', children: [blockquote('[!TIP] Example\nBody'), blockquote('Normal quote')] };
rehypeCallouts()(tree);
assert.equal(tree.children[0].tagName, 'aside');
assert.ok(tree.children[0].properties.className.includes('callout-tip'));
assert.equal(tree.children[0].children[0].children[1].children[0].value, 'Example');
assert.equal(tree.children[1].tagName, 'blockquote');
console.log('Minrock unified callouts verified');
