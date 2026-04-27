import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lumasync.app',
  // Cloudflare Pages 308s extensionless URLs to their trailing-slash twin.
  // Emitting sitemap + canonicals with the slash matches the live URL 1:1
  // so Google doesn't index the redirect form (was the cause of 30/34
  // sitemap URLs falling out of GSC's index in Apr 2026).
  trailingSlash: 'always',
  // Legacy URL → new slug. Keeps old references (external blogs, cached
  // search results) from 404-ing after the scenes-and-presets → scenes
  // rename. Astro emits a small meta-refresh HTML at the old path.
  redirects: {
    '/docs/advanced/scenes-and-presets': '/docs/advanced/scenes',
    '/docs/usb-leds/adalight-protocol': '/docs/usb-leds/serial-protocol',
    // Search-intent aliases — users (and Gemini AI Overview) type
    // "lumasync quick start" / "lumasync led calibration" but the
    // canonical slugs are first-setup / usb-leds/calibration.
    '/quick-start': '/docs/getting-started/first-setup',
    '/docs/getting-started/quick-start': '/docs/getting-started/first-setup',
    '/led-calibration': '/docs/usb-leds/calibration',
    '/docs/concepts/led-calibration': '/docs/usb-leds/calibration',
    '/hue-pairing': '/docs/hue/pairing',
    '/hue-entertainment': '/docs/hue/entertainment-area',
    '/usb-setup': '/docs/usb-leds/controllers',
    '/serialport': '/docs/usb-leds/serial-protocol',
    '/screens': '/docs/ambilight/screen-capture',
    '/multi-monitor': '/docs/advanced/multi-display',
    '/compare-tools': '/compare',
  },
  integrations: [mdx(), sitemap()],
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
