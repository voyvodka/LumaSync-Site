# Changelog — lumasync-site

This is the changelog for the **marketing/docs site** at lumasync.app. The
LumaSync app's own release notes live in the app repo and surface on
[/changelog](https://lumasync.app/changelog/) — site versions track
independently from app versions.

The site follows [Semantic Versioning](https://semver.org/) at its own
cadence; bumping the LumaSync app submodule does not require bumping the
site version.

## [1.1.0] — 2026-04-27

### Discoverability overhaul

Audit found 30 of 34 sitemap URLs excluded from Google's index due to a
sitemap-vs-canonical 308 redirect chain (Astro emitted slash-less URLs;
Cloudflare Pages redirected to slash-suffixed URLs). This release fixes
the root cause and adds the entity / intent / structure scaffolding AI
overviews need to disambiguate "lumasync".

### Added

- **Section index pages** for all six docs groups (`/docs/getting-started/`,
  `/docs/hue/`, `/docs/usb-leds/`, `/docs/ambilight/`, `/docs/advanced/`,
  `/docs/reference/`) — single shared dynamic route with group-specific
  lede + keyword padding.
- **SoftwareApplication** JSON-LD schema on the homepage (was only on
  `/download/`) so AI overviews can anchor "what is LumaSync" to a
  concrete software entity.
- **Article** JSON-LD schema on each compare leaf
  (`/compare/wled/`, `/compare/hue-sync/`, `/compare/hyperion/`,
  `/compare/prismatik/`).
- **"See how LumaSync compares"** section on the homepage with four
  competitor cards linking to the comparison pages — feeds homepage
  authority to the previously-orphaned compare leaves.
- **`## Disambiguation`** section in `llms.txt` listing what LumaSync
  is _not_ (Sync-on-Luma, Luma Labs, luma-sync.com, Lapster LUMA Sync).
  Mirrored as inline microcopy on the homepage compare CTA.
- **11 search-intent redirect aliases** in `astro.config.mjs`:
  `/quick-start`, `/docs/getting-started/quick-start`,
  `/led-calibration`, `/docs/concepts/led-calibration`,
  `/hue-pairing`, `/hue-entertainment`, `/usb-setup`, `/serialport`,
  `/screens`, `/multi-monitor`, `/compare-tools`.
- **Sublede paragraph** on `/compare/` index naming the four
  alternatives in bold for "lumasync alternatives" search intent.

### Changed

- **`trailingSlash: 'always'`** in `astro.config.mjs` (was `'never'`) so
  sitemap URLs and `<link rel="canonical">` match Cloudflare Pages'
  trailing-slash redirect target. **This is the load-bearing fix** for
  the 30/34 GSC indexation gap.
- **`Organization` schema** extended with `description`, `alternateName`
  (`["LumaSync", "Luma Sync"]`), `slogan`, `keywords`, `founder` (Person
  with sameAs), and broader `sameAs` (3 entries, was 1).
- **`SoftwareApplication.operatingSystem`** now an array
  (`["macOS", "Windows", "Linux"]`) instead of a comma-joined string —
  better validator and AI-engine parse.
- **H2 heading rewrites** for query-keyword alignment:
  - `install.mdx`: "Prerequisites" → "System requirements"
  - `hardware-checklist.mdx`: "For the USB LED path" → "USB LED path —
    WS2812B strips and controllers"
  - `controllers.mdx`: added "Supported chipsets — CH340 and FT232" H2
    above the existing chipset table
  - `serial-protocol.mdx`: kept Adalight in the existing H2
  - `tuning.mdx`: added "Quick reference — four tuning knobs" overview
    table at the top
  - `shortcuts.mdx`: "Global (app-wide)" → "Global shortcuts (app-wide)"
- **MDX H2 anchors for direct linking**:
  - `first-setup.mdx`: "What you'll do" → "Quick start"
  - `calibration.mdx`: added "LED calibration" H2 + intro paragraph
- **Landing-page meta-tag rewrites** for keyword coverage:
  - `/download/`: title → "Download LumaSync"; description adds
    DMG / MSI / AppImage installer keywords.
  - `/community/`: title → "Community & Support"; description adds
    "help, share builds, report bugs".
  - `/changelog/`: title → "Changelog — release notes"; description
    adds "release notes, version history".
- **Section-index ledes** strengthened:
  - `hue/`: prepended "Set up" to the lede.
  - `ambilight/`: rewritten to explicitly mention macOS/Windows/Linux
    screen-recording permissions, latency, and FPS.
- **`LAST_MODIFIED` middleware constant** bumped to
  `Mon, 27 Apr 2026 12:38:00 GMT` for content-edit deploys
  (was tied to app release dates only).
- **`updated:` frontmatter** bumped to `2026-04-27` on the seven MDX
  files touched.

### Fixed

- **Sitemap canonical mismatch** — URLs in `sitemap-0.xml` now match
  the live URL 1:1 (no 308 chain). Verified locally:
  `dist/sitemap-0.xml` emits `https://lumasync.app/compare/wled/` (slash);
  the live URL serves 200 directly.
- **`/docs/<group>/` 404s** — group root paths now resolve to index
  pages instead of falling through to the catch-all 404.

### Infrastructure

- **`.gitignore`** adds `.wrangler/` so local Cloudflare dev cache
  doesn't get committed.

### Site analytics state at release

- GSC: 4 indexed / 34 not indexed (88% miss rate) — expected to recover
  to ~34/34 over 7–14 days after this deploy.
- AI crawlers (Cloudflare AI Crawl Control, last 24 h): Bing 13,
  ClaudeBot 8, Googlebot 7, ChatGPT-User 0, PerplexityBot 0.
- Cloudflare Web Analytics: LCP P75 788 ms, CWV 100% Good — performance
  not a constraint, all effort on discoverability.

### Manual follow-ups (post-deploy)

These require human action and are tracked here so the next pass can
verify completion:

1. GSC → Sitemaps → resubmit `sitemap-index.xml`.
2. GSC → URL Inspection → Request Indexing on 8 priority URLs:
   `/`, `/download/`, `/docs/`, `/compare/`, `/compare/hue-sync/`,
   `/compare/wled/`, `/docs/getting-started/first-setup/`,
   `/docs/usb-leds/calibration/`.
3. Bing Webmaster Tools → "Import from Google Search Console" (instant
   verification because GSC is already DNS-verified).
4. chatgpt.com → search "what is lumasync.app" + "lumasync vs hue sync"
   to trigger ChatGPT-User fetch.
5. perplexity.ai → similar queries to trigger PerplexityBot fetch.
6. (Future) Open Mastodon / Bluesky profiles with `rel="me"` linking
   back to lumasync.app and add to `Organization.sameAs`.

## [1.0.0] — 2026-04-21

### Initial launch

- Astro 6 SSG, Cloudflare Pages, custom domain `lumasync.app` with
  `www → apex` redirect.
- 34 routes: homepage, `/download/`, `/changelog/`, `/community/`,
  `/license/`, `/privacy/`, `/compare/` index + 4 leaves,
  `/docs/` index + 19 leaves.
- JSON-LD schemas (Organization, WebSite, Article, ItemList, FAQPage,
  CollectionPage, BreadcrumbList) across all relevant routes.
- Pagefind static search index, Markdown for Agents content negotiation
  (`Accept: text/markdown` serves `.md` siblings), `llms.txt` and
  `llms-full.txt` for AI retrieval grounding.
- robots.txt with Cloudflare Content-Signal directive — training bots
  blocked, retrieval bots allowed.
