import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lumasync.app',
  trailingSlash: 'never',
  // Legacy URL → new slug. Keeps old references (external blogs, cached
  // search results) from 404-ing after the scenes-and-presets → scenes
  // rename. Astro emits a small meta-refresh HTML at the old path.
  redirects: {
    '/docs/advanced/scenes-and-presets': '/docs/advanced/scenes',
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
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
