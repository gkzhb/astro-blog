/**
 * Granular Feature Flags ("Complete by default, minimalist on demand")
 *
 * All flags default to `true` when omitted.
 * Minimalist or purist technical writers can set any flag to `false`
 * to completely eliminate markup, styles, and scripts during SSG build.
 */
export interface SiteFeatures {
  /** Full-text search modal + Ctrl/Cmd+K shortcuts + header triggers */
  search?: boolean;
  /** Sticky sidebar table of contents in blog posts */
  tableOfContents?: boolean;
  /** "X min read" badge in post headers */
  readingTime?: boolean;
  /** Accessible text-to-speech audio reader in blog posts and project details */
  audioPlayer?: boolean;
  /** Tag badges in post headers, article cards, and tag clouds */
  tags?: boolean;
  /** Notion-style share modal and trigger bar in blog posts */
  socialShare?: boolean;
  /** Theme toggle dropdown (White, Cream, Slate, Midnight) */
  themeSwitcher?: boolean;
  /** Floating smooth-scroll back-to-top button */
  backToTop?: boolean;
  /** Medium-style smooth image zoom modal on click */
  imageZoom?: boolean;
  /** Interactive blog comments powered by ScatterLeaf */
  comments?: boolean;
}

export interface SiteConfig {
  title: string;
  tagline: string;
  description: string;
  author: string;
  siteUrl: string;
  defaultTheme: 'white' | 'cream' | 'slate' | 'midnight';
  features?: SiteFeatures;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  navLinks: {
    title: string;
    href: string;
  }[];
  comments?: {
    enabled: boolean;
    provider: 'scatterleaf';
    repo: string;
    category?: string;
    theme?: 'auto' | 'light' | 'dark' | 'cream' | 'midnight' | 'slate';
    lang?: string;
    broker?: string;
    clientId?: string;
    order?: 'oldest' | 'newest';
    features?: {
      reactions?: boolean;
      skinTone?: boolean;
      sorting?: boolean;
      codeScroll?: boolean;
      preview?: boolean;
      search?: boolean;
      images?: boolean;
    };
  };
}

export const siteConfig: SiteConfig = {
  title: "gkzhb's blog",
  tagline: '记录技术、工具与思考。',
  description: 'gkzhb 的个人博客，分享软件开发、Linux、工具实践与学习笔记。',
  author: 'gkzhb',
  siteUrl: process.env.SITE_URL || 'https://blog.gkzhb.top/',
  defaultTheme: 'cream',
  features: {
    search: true,
    tableOfContents: true,
    readingTime: true,
    audioPlayer: false,
    tags: true,
    socialShare: true,
    themeSwitcher: true,
    backToTop: true,
    imageZoom: true,
    comments: false,
  },
  socialLinks: {
    github: 'https://github.com/gkzhb',
  },
  navLinks: [
    { title: '首页', href: '/' },
    { title: '文章', href: '/posts/' },
    { title: '分类', href: '/categories/' },
    { title: '标签', href: '/tags/' },
    { title: '关于', href: '/about/' },
  ],
};
