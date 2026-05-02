# Changelog — lumasync-site

This is the changelog for the **marketing/docs site** at lumasync.app. The LumaSync app's own release notes live in the app repo and surface on [/changelog](https://lumasync.app/changelog/) — site versions track independently from app versions.

The site follows [Semantic Versioning](https://semver.org/) at its own cadence; bumping the LumaSync app submodule does not require bumping the site version.

## [1.1.7] — 2026-05-02

### Security

- **Markdown→HTML XSS hardening**: the `/changelog/` page reads `vendor/lumasync/CHANGELOG.md` from the pinned submodule, parses it with `marked`, and injects the result via Astro's `set:html`. Because `marked` preserves inline raw HTML, an upstream payload (`<script>` / `onclick=` etc.) would have rendered verbatim into the deployed page. The parsed HTML now passes through `DOMPurify.sanitize()` (via `isomorphic-dompurify` for SSR) before being assigned, so unsafe tags and attributes are stripped at build time. Defends against a supply-chain compromise of the vendor changelog content path.

## [1.1.6] — 2026-05-01

### Fixed

- **`/security` URL alias**: added `public/_redirects` with single-hop 301 rules for `/security` and `/security/` pointing at the canonical `/.well-known/security.txt`. Closes the UX gap where bare `/security` probes (the convention exposed by GitHub, Stripe, Cloudflare) returned 404 even though the RFC 9116 endpoint was always live. Cloudflare Pages evaluates `_redirects` ahead of the trailing-slash 308 layer, so each rule catches the request directly without the double-hop a meta-refresh redirect would introduce.

## [1.1.5] — 2026-05-01

### SEO

- **Per-URL sitemap `lastmod`**: added a `serialize` callback to `@astrojs/sitemap` that resolves each URL to its source file (page or content collection entry) and stamps `<lastmod>` from `git log -1 --format=%cI`. Routes without an obvious source mapping omit `<lastmod>` rather than emit a wrong build-date value, since Google deprioritizes `lastmod` sitewide when it detects untrustworthy values. Provides accurate per-URL freshness signals to help drain the GSC indexing queue for sub-pages.

## [1.1.4] — 2026-05-01

### Accessibility

- **Keyboard focus indicators**: added `:focus-visible` outline rules using the existing `var(--focus-ring)` design token to two interactive elements that previously rendered no visible focus state — the modal close button in `src/components/Search.astro` and the search CTA button in `src/pages/404.astro`. Keyboard navigation now surfaces focus on these controls consistently with the rest of the site.

## [1.1.3] — 2026-04-30

### Security

- **JSON-LD script-breakout XSS**: in `src/components/Schema.astro`, the raw output of `JSON.stringify` is now post-processed with three replaces — `<` → `\u003c`, `>` → `\u003e`, `&` → `\u0026` — before being injected into the inline `<script type="application/ld+json">` tag, so a `</script>` substring inside any schema field can't break out of the script context. Also wrap `r.url` with the existing `escapeHtml` helper in `src/components/Search.astro` to block attribute injection on dynamically-rendered search-result links.

## [1.1.2] — 2026-04-30

### Performance

- **OG image I/O**: parallelized three font `readFile` calls and two content collection fetches in `src/pages/og/[...route].ts` into a single `Promise.all`, reducing module initialization time from the sum of all five I/O operations to the duration of the slowest one.

### Security

- **Security headers**: added `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to the `public/_headers` catch-all rule.

## [1.1.1] — 2026-04-27

### Fixed

- **Favicon**: regenerated `public/favicon.svg` to match the brand monogram on a 64×64 viewBox with a heavier mark stroke so Google's 16×16 search-result favicon scaling stays legible — the previous thin-slash 32×32 version was getting visually collapsed.
- **PNG favicon fallbacks**: added `/favicon-32.png` and `/favicon-192.png` Astro endpoints (Resvg-rendered from `app-icon.svg`) plus matching `<link rel="icon" sizes="...">` entries in `BaseLayout.astro` and the webmanifest icon array, so search engines that prefer raster favicons get a clean, sized rasterization instead of scaling SVG themselves.
- **Release notes wrap**: switched prettier `proseWrap` to `"never"` for `*.md` and `*.mdx`, and rewrote `CHANGELOG.md` with one-bullet-per-line so GitHub's Releases renderer no longer breaks bullet text mid-line.

### Documentation

- **`CLAUDE.md`**: project-level governance file added — public-repo privacy rules, pre-commit checklist for sensitive content, commit hygiene reminders. Future agent passes consult this before staging.
- **`CHANGELOG.md`**: removed internal analytics snapshots (raw GSC index counts, AI-crawler hit counts, Web Analytics percentile values) from the v1.1.0 entry. Discoverability work is now described qualitatively. Internal observability metrics live in private notes outside the repo.

## [1.1.0] — 2026-04-27

### Discoverability overhaul

A site audit surfaced a sitemap-vs-canonical 308 redirect chain (Astro emitted slash-less URLs; Cloudflare Pages redirected to slash-suffixed URLs) that was throttling Google's indexing of sub-pages. This release fixes the root cause and adds the entity / intent / structure scaffolding AI overviews need to disambiguate "lumasync".

### Added

- **Section index pages** for all six docs groups (`/docs/getting-started/`, `/docs/hue/`, `/docs/usb-leds/`, `/docs/ambilight/`, `/docs/advanced/`, `/docs/reference/`) — single shared dynamic route with group-specific lede + keyword padding.
- **SoftwareApplication** JSON-LD schema on the homepage (was only on `/download/`) so AI overviews can anchor "what is LumaSync" to a concrete software entity.
- **Article** JSON-LD schema on each compare leaf (`/compare/wled/`, `/compare/hue-sync/`, `/compare/hyperion/`, `/compare/prismatik/`).
- **"See how LumaSync compares"** section on the homepage with four competitor cards linking to the comparison pages — feeds homepage authority to the previously-orphaned compare leaves.
- **`## Disambiguation`** section in `llms.txt` listing what LumaSync is _not_ (Sync-on-Luma, Luma Labs, luma-sync.com, Lapster LUMA Sync). Mirrored as inline microcopy on the homepage compare CTA.
- **11 search-intent redirect aliases** in `astro.config.mjs`: `/quick-start`, `/docs/getting-started/quick-start`, `/led-calibration`, `/docs/concepts/led-calibration`, `/hue-pairing`, `/hue-entertainment`, `/usb-setup`, `/serialport`, `/screens`, `/multi-monitor`, `/compare-tools`.
- **Sublede paragraph** on `/compare/` index naming the four alternatives in bold for "lumasync alternatives" search intent.

### Changed

- **`trailingSlash: 'always'`** in `astro.config.mjs` (was `'never'`) so sitemap URLs and `<link rel="canonical">` match Cloudflare Pages' trailing-slash redirect target. **This is the load-bearing fix** for the GSC indexation gap on sub-pages.
- **`Organization` schema** extended with `description`, `alternateName` (`["LumaSync", "Luma Sync"]`), `slogan`, `keywords`, `founder` (Person with sameAs), and broader `sameAs` (3 entries, was 1).
- **`SoftwareApplication.operatingSystem`** now an array (`["macOS", "Windows", "Linux"]`) instead of a comma-joined string — better validator and AI-engine parse.
- **H2 heading rewrites** for query-keyword alignment: `install.mdx` Prerequisites → System requirements; `hardware-checklist.mdx` "For the USB LED path" → "USB LED path — WS2812B strips and controllers"; `controllers.mdx` adds "Supported chipsets — CH340 and FT232" above the existing chipset table; `tuning.mdx` adds a "Quick reference — four tuning knobs" overview table at the top; `shortcuts.mdx` "Global (app-wide)" → "Global shortcuts (app-wide)".
- **MDX H2 anchors for direct linking**: `first-setup.mdx` "What you'll do" → "Quick start"; `calibration.mdx` adds "LED calibration" H2 + intro paragraph.
- **Landing-page meta-tag rewrites** for keyword coverage: `/download/` title → "Download LumaSync" and description adds DMG / MSI / AppImage installer keywords; `/community/` title → "Community & Support" with help/bugs phrasing; `/changelog/` title → "Changelog — release notes" with version-history phrasing.
- **Section-index ledes** strengthened: `hue/` prepends "Set up"; `ambilight/` rewritten to explicitly mention macOS/Windows/Linux screen-recording permissions, latency, and FPS.
- **`LAST_MODIFIED` middleware constant** bumped to today's RFC 1123 stamp for content-edit deploys (was tied to app release dates only).
- **`updated:` frontmatter** bumped to `2026-04-27` on the seven MDX files touched.

### Fixed

- **Sitemap canonical mismatch** — URLs in `sitemap-0.xml` now match the live URL 1:1 (no 308 chain). Verified locally: `dist/sitemap-0.xml` emits `https://lumasync.app/compare/wled/` (slash); the live URL serves 200 directly.
- **`/docs/<group>/` 404s** — group root paths now resolve to index pages instead of falling through to the catch-all 404.

### Infrastructure

- **`.gitignore`** adds `.wrangler/` so local Cloudflare dev cache stays out of git.

### Manual follow-ups (post-deploy)

These require human action and are tracked here so the next pass can verify completion:

1. GSC → Sitemaps → resubmit `sitemap-index.xml`.
2. GSC → URL Inspection → Request Indexing on 8 priority URLs: `/`, `/download/`, `/docs/`, `/compare/`, `/compare/hue-sync/`, `/compare/wled/`, `/docs/getting-started/first-setup/`, `/docs/usb-leds/calibration/`.
3. Bing Webmaster Tools → "Import from Google Search Console" (instant verification because GSC is already DNS-verified).
4. chatgpt.com → search "what is lumasync.app" + "lumasync vs hue sync" to trigger ChatGPT-User fetch.
5. perplexity.ai → similar queries to trigger PerplexityBot fetch.
6. (Future) Open Mastodon / Bluesky profiles with `rel="me"` linking back to lumasync.app and add to `Organization.sameAs`.

## [1.0.0] — 2026-04-21

### Initial launch

- Astro 6 SSG, Cloudflare Pages, custom domain `lumasync.app` with `www → apex` redirect.
- 34 routes: homepage, `/download/`, `/changelog/`, `/community/`, `/license/`, `/privacy/`, `/compare/` index + 4 leaves, `/docs/` index + 19 leaves.
- JSON-LD schemas (Organization, WebSite, Article, ItemList, FAQPage, CollectionPage, BreadcrumbList) across all relevant routes.
- Pagefind static search index, Markdown for Agents content negotiation (`Accept: text/markdown` serves `.md` siblings), `llms.txt` and `llms-full.txt` for AI retrieval grounding.
- robots.txt with Cloudflare Content-Signal directive — training bots blocked, retrieval bots allowed.
