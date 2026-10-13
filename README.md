# gkzhb's blog

A static personal blog built with **Astro 7**, using [Minrock](https://github.com/rnt-rez/minrock) layouts, components and styles.

## Development

Use Node.js **22.22.0** (minimum 22.12.0). CI uses pnpm **10.34.6**; local commands use your installed pnpm. The project deliberately omits `packageManager` to avoid auto-downloading a different pnpm version through a global/private registry before scripts can start.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm build
node scripts/verify-migration.mjs
node scripts/test-callouts.mjs
node scripts/test-dev-start.mjs
pnpm preview
```

The verification script runs against `dist/` after a production build. It checks published/draft article routes, legacy Hugo redirects, RSS/search, categories/tags, canonical URLs, math and the existing MDX React example.

## Site and content

- Site metadata, navigation and feature flags: `src/config/site.ts`.
- Existing articles stay in `src/content/posts/`; Markdown and MDX are supported.
- Existing `published` / `updated` frontmatter is adapted to Minrock's `pubDate` / `updatedDate` by `src/content.config.ts`; no bulk article rewrite is required.
- Article URLs remain `/posts/<id>/`; `/post/<id>/` produces static redirect pages for GitHub Pages.
- Draft articles are excluded from production pages, feeds and search. Hidden/unlisted articles retain direct links but are excluded from discovery and the sitemap.
- About content remains in `src/content/specials/about.md`.
- Existing `Linux/linux` and `Blog/blog` tags are merged during loading, without editing articles. Original uppercase URLs remain compatible and use the lowercase canonical URL.
- The production domain defaults to `https://blog.gkzhb.top/`. `SITE_URL` can override it for another deployment.
- The global footer is `src/components/Footer.astro`; registration details should only be added once the actual number and official query URL are available.
- Demo comments and third-party translation are disabled; no upstream sample articles or projects are published.

## Deployment

The existing GitHub Pages deployment target is unchanged: `gkzhb/gkzhb.github.io`, using `DEPLOY_KEY`. CI pins Node and pnpm, installs from the lockfile, checks types, builds and verifies routes before deployment.

## Dependency compatibility

Shared pnpm 10/12 settings live in `pnpm-workspace.yaml`, not the removed `package.json#pnpm` configuration. PostCSS is pinned to 8.5.29 so pnpm 12 can retain its minimum release-age protection.

`@astrojs/react@7.0.1` uses OXC `^0.145.0`. Its transitive `@vitejs/plugin-react` is pinned to **6.1.1** because 6.1.2 changed its OXC peer to `^0.152.0`. Re-evaluate this scoped override when upgrading the React integration.

## Theme provenance

Minrock **0.2.2**, upstream commit `4135d1ba760ef54ea1be22d36be97fe998ceb49c`. The theme is vendored source, not an npm integration. Future theme updates should compare upstream changes against the local components/layouts/styles rather than replacing the whole repository.

Minrock's MIT notice is preserved in `LICENSE.minrock`. Blog content retains **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
