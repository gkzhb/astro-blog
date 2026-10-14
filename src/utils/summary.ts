import { createMarkdownProcessor, type RemarkPlugin } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';

interface SummaryNode {
  type: string;
  value?: string;
  children?: SummaryNode[];
}

interface SummaryResult {
  text: string;
  hasMore: boolean;
}

const MORE = /^<!--\s*more\s*-->$/i;
const BLOCKS = new Set(['paragraph', 'heading', 'blockquote', 'list', 'listItem', 'table', 'tableRow']);
const SKIP = new Set(['code', 'image', 'imageReference', 'definition', 'math', 'inlineMath']);

// Use Markdown's syntax tree instead of regex stripping: reference links,
// nested emphasis and HTML entities are handled by the existing parser.
const remarkSummary: RemarkPlugin = () => {
  return (tree, file) => {
    const astro = file.data.astro ??= {};
    const frontmatter = astro.frontmatter ??= {};
    let hasMore = false;
    const parts: string[] = [];
    function visit(node: SummaryNode): void {
      if (hasMore || SKIP.has(node.type)) return;
      if (node.type === 'html') {
        if (!frontmatter.ignoreSummaryMore && MORE.test(node.value?.trim() ?? '')) hasMore = true;
        return;
      }
      // MDX module declarations are not prose.
      if (node.type === 'paragraph' && /^(?:import|export)\s/.test(node.children?.[0]?.value ?? '')) return;
      if (node.type === 'text' || node.type === 'inlineCode') parts.push(node.value ?? '');
      for (const child of node.children ?? []) visit(child);
      if (BLOCKS.has(node.type) || node.type === 'break' || node.type === 'tableCell') parts.push(' ');
    }
    visit(tree as SummaryNode);
    frontmatter.summary = {
      text: parts.join('').replace(/\s+/g, ' ').trim(),
      hasMore,
    };
    // No HTML output is needed; avoid rendering the remaining article/MDX.
    (tree as SummaryNode).children = [];
  };
};

const processor = createMarkdownProcessor({
  syntaxHighlight: false,
  smartypants: false,
  remarkPlugins: [remarkMath, remarkSummary],
});

/**
 * Prefer explicit descriptions, then prose before a real more comment.
 * Only unmarked bodies are truncated; code examples containing more are ignored.
 */
export async function postSummary(
  description: string | undefined,
  body: string | undefined,
  maxLength = 150,
): Promise<string> {
  if (description?.trim()) return description.trim();
  if (!body?.trim()) return '';
  const renderer = await processor;
  let result = await renderer.render(body);
  // Some legacy posts put more at the very start, with no introductory prose.
  if (!result.metadata.frontmatter.summary.text && result.metadata.frontmatter.summary.hasMore) {
    result = await renderer.render(body, { frontmatter: { ignoreSummaryMore: true } });
  }
  const { text, hasMore } = result.metadata.frontmatter.summary as SummaryResult;
  const characters = Array.from(text);
  return hasMore || characters.length <= maxLength
    ? text
    : `${characters.slice(0, maxLength).join('').trimEnd()}…`;
}
