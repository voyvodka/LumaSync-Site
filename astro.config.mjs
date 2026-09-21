import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Resolves a sitemap URL to its source file so we can stamp <lastmod>
// from git history. Returns null when no obvious mapping exists — we'd
// rather omit lastmod than emit a wrong one (Google deprioritizes
// lastmod across the whole site when it detects untrustworthy values,
// e.g. every URL stamped with the build date).
function urlToSourceFile(url) {
  const pathname = new URL(url).pathname;

  const staticRoutes = {
    '/': 'src/pages/index.astro',
    '/changelog/': 'src/pages/changelog.astro',
    '/community/': 'src/pages/community.astro',
    '/compare/': 'src/pages/compare/index.astro',
    '/docs/': 'src/pages/docs/index.astro',
    '/download/': 'src/pages/download.astro',
    '/license/': 'src/pages/license.astro',
    '/privacy/': 'src/content/legal/privacy.mdx',
  };
  if (staticRoutes[pathname]) return staticRoutes[pathname];

  const compareSlug = pathname.match(/^\/compare\/([^/]+)\/$/);
  if (compareSlug) {
    const f = `src/content/compare/${compareSlug[1]}.mdx`;
    if (existsSync(f)) return f;
  }

  const docsGroup = pathname.match(/^\/docs\/([^/]+)\/$/);
  if (docsGroup) return 'src/pages/docs/[group]/index.astro';

  const docsEntry = pathname.match(/^\/docs\/([^/]+)\/([^/]+)\/$/);
  if (docsEntry) {
    const f = `src/content/docs/${docsEntry[1]}/${docsEntry[2]}.mdx`;
    if (existsSync(f)) return f;
  }

  return null;
}

const gitMtimeCache = new Map();

function gitLastmod(file) {
  if (gitMtimeCache.has(file)) return gitMtimeCache.get(file);
  let result = null;
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) result = out;
  } catch {
    // Shallow clone or non-git build env — fall through to null.
  }
  gitMtimeCache.set(file, result);
  return result;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://lumasync.app',
  // Cloudflare Pages 308s extensionless URLs to their trailing-slash twin.
  // Emitting sitemap + canonicals with the slash matches the live URL 1:1
  // so Google doesn't index the redirect form (which was previously
  // blocking sub-page indexing).
  trailingSlash: 'always',
  // Aliases and legacy slugs live in `public/_redirects`, not here. Astro's
  // `redirects` map renders each entry as an HTML page with a meta-refresh,
  // which costs a second hop once `trailingSlash: 'always'` has already 308'd
  // the slashless request. The edge rules resolve in one 301 — verified with
  // the hop-count probe, not assumed.
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const source = urlToSourceFile(item.url);
        if (source) {
          const lastmod = gitLastmod(source);
          if (lastmod) item.lastmod = lastmod;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  // Dev toolbar is disabled because its runtime entry requests a
  // source-map file that Astro's dev server doesn't emit, producing
  // a 404 per page load in the dev terminal. Re-enable if/when the
  // upstream fix lands (astro issue tracker).
  devToolbar: { enabled: false },
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  // Phase 2 additions (tracked in .thinking/02-website.md):
  //   - @astrojs/react integration for interactive demo islands
  //   - vite.resolve.alias for @tauri-apps mocks + @lumasync → vendor/lumasync/src
});
