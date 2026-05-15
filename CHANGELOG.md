# Changelog — lumasync-site

This is the changelog for the **marketing/docs site** at lumasync.app. The LumaSync app's own release notes live in the app repo and surface on [/changelog](https://lumasync.app/changelog/) — site versions track independently from app versions.

The site follows [Semantic Versioning](https://semver.org/) at its own cadence; bumping the LumaSync app submodule does not require bumping the site version.

## [1.1.14] — 2026-05-15

### Dependencies

- **`devalue` bumped 5.8.0 → 5.8.1**: transitive dep via Astro, used to serialize server-rendered state into the client hydration bundle. Upstream patch forces sparse arrays to allocate sparsely (sveltejs/devalue@206ca67), a defensive fix for a memory-blowup vector when hydration payloads contain sparse-array structures. Lockfile-only — no source change in this repo.

## [1.1.13] — 2026-05-14

### Security

- **Single-quote escape in Pagefind result rendering**: `src/components/Search.astro`'s `escapeHtml` helper was neutralizing `&`, `<`, `>`, and `"` before injecting Pagefind result excerpts into the DOM, but left `'` untouched. While single quotes are not always dangerous in HTML element-content position, they become an attribute-context breakout vector if the result excerpt is ever rendered inside a single-quoted attribute or the surrounding template shifts. Added `'` → `&#39;` to the existing escape chain so all five script/attribute-sensitive characters are uniformly neutralized regardless of where the search excerpt ends up. Mirrors the same hardening applied to `Schema.astro` in v1.1.11.

### Performance

- **Cached Pagefind init Promise + O(1) keyboard navigation in `Search.astro`**: `loadPagefind` previously memoized only the *resolved* module, which left a race window where a keyboard shortcut + rapid keystrokes could each trigger their own `import()` + `Pagefind.init()` cycle before any of them finished. The cache now holds the in-flight Promise, so concurrent callers await the same initialization. Separately, `setActive` was iterating the entire result NodeList on every Arrow / Tab keypress to toggle `data-active` — replaced with targeted mutations of only the previously-active and newly-active nodes (O(N) → O(1)), eliminating per-keystroke layout work on long result lists.

### UX

- **Tactile click feedback + focus ring on download installer cards**: `src/pages/download.astro` `.card` elements now scale to `0.96` on `:active` (wrapped in `@media (prefers-reduced-motion: no-preference)`) and render an explicit `:focus-visible` outline for keyboard navigation. Disabled cards (`.card-disabled`) are excluded from both. Extends the same tactile affordance shipped on landing-page CTAs in v1.1.12 to the primary conversion surface on `/download/`.
- **Focus-visible + active states on `DocsSidebar.astro` links**: docs sidebar links now show a 2px focus-visible outline (inset offset so it doesn't clip the active-page indicator) and scale to `0.96` on `:active`, wrapped in `prefers-reduced-motion: no-preference`. Closes the last remaining navigation surface that lacked tactile / keyboard parity with the rest of the site.

### CI

- **`pnpm/action-setup` bumped 6.0.5 → 6.0.6**: pulls in upstream fix where the action's `bin_dest` output now points to the self-updated pnpm rather than the bootstrap binary (pnpm/action-setup#249). No effect on the current workflow's output usage, but keeps the pin current.

## [1.1.12] — 2026-05-09

### Security

- **Content-Security-Policy header on all responses**: `public/_headers` now sets a baseline CSP under `/*` so every HTML response carries it. Policy is restrictive-by-default (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `block-all-mixed-content`, `upgrade-insecure-requests`) with the minimum allowances Astro and the analytics bundle need: `'unsafe-inline'` on `script-src` / `style-src` (Astro emits inline hydration shims and scoped style blocks), `https:` on `script-src` / `connect-src` / `img-src` for the third-party analytics endpoint, and `data:` on `img-src` / `font-src`. Adds a defense-in-depth layer behind the existing input-sanitization fixes from v1.1.9 / v1.1.11 — if any future XSS vector slipped through, the CSP would block eval, mixed content, framing, and external object loads.

### Performance

- **Cached focus-trap NodeList in `Header.astro`**: the mobile-nav focus trap was calling `panel.querySelectorAll(focusableSelector)` inside the `keydown` handler on every `Tab` press, repeating the same DOM query and risking layout thrashing during rapid keyboard navigation. The query now runs once when the nav opens and is stored in a closure-scoped `cachedFocusable`; the `keydown` branch reads the cached `NodeList` instead. Same focus-trap semantics, near-zero per-keystroke DOM cost.

### UX

- **Tactile click feedback on landing-page CTAs and comparison cards**: `src/pages/index.astro` and `src/components/CompareCTA.astro` now apply `transform: scale(0.96)` on `:active` for `.cta-primary`, `.cta-secondary`, and `.compare-card`, with `transform` added to each element's `transition` list so the scale eases in / out at `var(--duration-fast)` rather than snapping. The `:active` rule is wrapped in `@media (prefers-reduced-motion: no-preference)` to honour the reduced-motion contract. Extends the same tactile affordance shipped on the 404 page in v1.1.11 to the primary conversion surfaces on the landing page.

## [1.1.11] — 2026-05-07

### Security

- **Single-quote escape in JSON-LD serialization**: `src/components/Schema.astro` was injecting `JSON.stringify` output into `<script type="application/ld+json">` via `set:html` with `<`, `>`, and `&` escaped to their `\u00xx` forms, but single quotes left through unchanged. While JSON does not require escaping `'`, leaving it raw inside an HTML script-context payload is a latent script-breakout vector if the script-tag is ever wrapped in a single-quoted attribute or the surrounding template shifts. Added `.replace(/'/g, '\\u0027')` to the existing escape chain so all four script-context-sensitive characters are uniformly neutralized regardless of where the schema string ends up.

### UX

- **Tactile click feedback on 404 page CTAs**: the `Search`, `Home`, and recovery-link controls on `src/pages/404.astro` now scale to `0.96` on `:active`, wrapped in `@media (prefers-reduced-motion: no-preference)` so reduced-motion users are unaffected. Matches the same affordance applied to header / search / nav controls in v1.1.9, restoring perceived responsiveness on the one user-facing page that had been missed.

## [1.1.10] — 2026-05-06

### SEO

- **Internal-link canonicalization across the URL surface.** Astro config sets `trailingSlash: 'always'` so canonical URLs and sitemap entries end with `/`, but the rest of the site had drifted to slashless internal references — every header / footer nav item, every body link, every `breadcrumbSchema` / `itemList` / `softwareApp.downloadUrl` field, both `compareHref` / `docHref` helpers in `src/lib/content.ts`, the legacy alias targets in `astro.config.mjs`, every URL in `public/llms.txt`, and ~100 markdown links across `src/content/**/*.mdx`. Each slashless link triggered a 308 redirect, and the legacy aliases formed a 2-hop meta-refresh + 308 chain. The April fix repaired the sitemap; this commit completes the consistency pass across the remaining surfaces. Expected impact: clears the redirect-related "Page indexing" entries in Search Console and frees crawl budget previously wasted on internal redirects.
- **`Header.astro` `isActive` simplified.** With trailing-slash hrefs, the previous `pathname === href || pathname.startsWith(\`${href}/\`)` form no longer matches sub-pages. Replaced with `pathname.startsWith(href)` — same semantics, fewer special cases.

## [1.1.9] — 2026-05-05

### Security

- **DOM-based XSS in Pagefind search results**: `src/components/Search.astro` was injecting Pagefind result excerpts into the DOM via `innerHTML` with `${r.excerpt || ''}` unescaped. Indexed content reaching the excerpt could break out and execute arbitrary HTML. Excerpts now flow through a `sanitizeExcerpt` helper that HTML-escapes the whole string and then selectively restores the `<mark>` / `</mark>` tags Pagefind needs for search-term highlighting, preserving the highlight UI without trusting raw excerpt content.

### Accessibility

- **Native tooltips on icon-only buttons**: the header search trigger, the mobile nav open/close buttons, and the search modal `Esc` close button now carry matching `title` attributes alongside their `aria-label`s. Visual users hovering an icon now get the same affordance keyboard / screen-reader users already had, removing ambiguity for buttons that have no text label.
- **Tactile click feedback**: the same controls gain a subtle `transform: scale(0.96)` on `:active`, wrapped in `@media (prefers-reduced-motion: no-preference)` so users who opt out of motion are unaffected. Adds perceived responsiveness on click without compromising the reduced-motion contract.

## [1.1.8] — 2026-05-05

### Content

- **App v1.5.0 + v1.5.1 + v1.5.2 surfaced on the site.** Submodule pin advanced from the v1.4.0 merge (`79c8407`) to post-v1.5.2 (`b1db41a`), so `LATEST_VERSION` / `LATEST_VERSION_DATE` now resolve to `v1.5.2 — 2026-05-05` from the upstream changelog without code changes. Three site-version-spans of upstream work are now reflected in landing copy, structured data, llms.txt, and docs.
- **Landing page roadmap shift**: the "Shipped" column rewrote from v1.4 highlights (per-LED sampling, Adalight profile, multi-monitor capture, FPS pill) to v1.5.2 highlights (WLED bridge over Wi-Fi, Hue Zones, Linux X11 capture, SK6812 RGBW, OS keychain credentials, per-bulb gamut clipping, beta update channel, macOS lifecycle hardening, visibility-aware polling, frontend log bridge). The "Next" column rewrote from "v1.5 — in flight" to "v1.6 — queued" (Flathub, gtk-rs / glib migration, OpenRGB sink, companion firmware repo).
- **Linux platform support**: card promoted from "Experimental" to "Supported" across landing, FAQ, hero platform-note, and download page asset hint (`AppImage · experimental` → `AppImage · deb · rpm`). Reflects the v1.5.0 native X11 capture via xcap and the v1.5.1 lockstep three-installer release pipeline.
- **Three-sink narrative**: feature grid expanded from a 3-card "USB · Hue · Both" layout to a 4-card "USB · WLED · Hue · All three, synchronized" layout. Hero copy, ItemList JSON-LD, and softwareAppSchema description rewrote to mention WS2812B / SK6812 RGBW USB, WLED-over-Wi-Fi, and Philips Hue together.

### Docs

- **New `docs/usb-leds/wled.mdx`** — full WLED bridge reference: DDP-over-UDP, mDNS auto-discovery (`_wled._tcp.local.`), manual IP fallback, IP guard rejecting loopback / unspecified / multicast / broadcast, `WLED_INVALID_LED_COUNT` rejection, network reachability checklist, "why DDP and not E1.31 / Art-Net" notes.
- **`getting-started/install.mdx`** rewrote — three Linux installers (AppImage / deb / rpm), Windows MSI v1.5.1+ stable, Linux "experimental" wording removed, X11 capture deps (`libxcb`, `libxrandr`, `libpipewire`, `libdbus`) called out.
- **`getting-started/first-setup.mdx`** — added the v1.5.0 first-run onboarding banner, the v1.5.2 close-to-tray notification, the WLED pairing step, and the chip-type selector (WS2812B / SK6812 RGBW) at USB connect time. mDNS + cloud-fallback Hue discovery clarified.
- **`getting-started/hardware-checklist.mdx`** — corrected the `WS2812B (aka SK6812 in most drop-in forms)` mistake (SK6812 RGBW is a distinct 4-channel chip, not a drop-in for WS2812B), expanded the USB chipset table to six entries (CH340, CH341, FT232R, FT232H, PL2303, CP2104), added a third "WLED path" section.
- **`usb-leds/controllers.mdx`** — six chipsets covered, USB-class endpoint filtering (`PORT_UNSUPPORTED` for Bluetooth / PCI / Unknown), strip-chip selector documented, OS detection one-liners updated to match.
- **`usb-leds/serial-protocol.mdx`** — chip-type section added covering WS2812B (3 bytes / LED) and SK6812 RGBW (4 bytes / LED with `W = min(R, G, B)` extraction), wire-format diagram updated to be chip-type-agnostic.
- **`usb-leds/calibration.mdx`** — direct numeric keyboard input on edge counts and stand-gap (v1.5.2), amber Rev 07 design tokens with a 32 px tap-target floor (v1.5.2), Hue Zones cross-link.
- **`usb-leds/troubleshooting.mdx`** — `PORT_UNSUPPORTED` failure mode added with the macOS Bluetooth-virtual-port example.
- **`hue/pairing.mdx`** — mDNS-as-primary discovery (`_hue._tcp.local.` shared responder with WLED), cloud endpoint demoted to fallback, **bridge username + PSK now stored in the OS keychain** (macOS Keychain / Windows CredMan / Linux Secret Service), idempotent + downgrade-safe v1.4 → v1.5 migration noted.
- **`hue/entertainment-area.mdx`** — new "Hue Zones" section (zone-relative coordinates, AR-locked sizing, schema 1→2 migration), new "Per-bulb gamut clipping" section (A/B/C triangle xy → RGB mapping in the DTLS frame builder hot-path).
- **`hue/troubleshooting.mdx`** — `HUE_STREAM_NOT_READY_ACTIVE_STREAMER` 403 noted as retired in v1.5.2 via DTLS `close_notify` alert + idempotent single-shot deactivate token; previous 1 s defensive sleep removed.
- **`advanced/auto-updater.mdx`** — beta update channel (`updateChannel: 'stable' | 'beta'`) documented with `latest-beta.json` endpoint and the no-immediate-downgrade behaviour.
- **`advanced/multi-display.mdx`** — Linux hot-plug now via xcap RandR events (X11) and XWayland fallback (Wayland).
- **`ambilight/screen-capture.mdx`** — Linux X11 via xcap as the default Linux path (no portal dialogs), Windows hardware-accelerated downscale scaffold (v1.5.0).
- **`reference/telemetry.mdx`** — runtime network call table extended with mDNS rows and the WLED `/json/info` + DDP UDP entries; visibility-aware polling discipline section added; Hue credential storage corrected to "OS keychain, not `app.json`".
- **`reference/notifications.mdx`** — added the `wled.connected` event and the v1.5.2 one-shot `window.closed-to-tray` notification, the macOS template tray icon, and the frontend `console.*` → file-sink log bridge.
- **`reference/shortcuts.mdx`** — Cmd+Q / tray Quit / Ctrl+C unified shutdown path noted on the global table; new "Compact-mode deep links" section covering the v1.5.2 auto-expand-to-full behaviour.
- **`reference/error-handling.mdx`** — new "macOS lifecycle hardening (v1.5.2)" section covering `kick_off_shutdown_and_die`, `SHUTDOWN_FIRED` atomic, the `tauri-plugin-single-instance` socket-leak fix, and the detached `stop_hue_stream` worker thread with 1.5 s abandon timeout.
- **`reference/config-file.mdx`** — `schemaVersion`, `updateChannel`, `wled.targets`, and zone-aware `roomMap` fields added to the shape table; explicit "Hue username + PSK live in the OS keychain, not this file" callout; window-position persistence now anchored by window centre with a monitor-clamp guard.
- **`compare/wled.mdx`** — reframed top-to-bottom: WLED is no longer "a thing LumaSync can't drive" but a complementary sink that LumaSync drives natively over DDP from v1.5.0. Recommended setup is "WLED + LumaSync together" for ESP-based hardware; standalone WLED and standalone LumaSync USB-serial each retain their own sweet spots.

### Discoverability

- **`public/llms.txt`** — opening summary expanded to mention WS2812B / SK6812 RGBW over USB, ESP32 / ESP8266 boards over Wi-Fi via DDP, and the OS keychain for credentials. WLED moved out of the "alternatives we don't drive" list and into a complementarity note. Docs link list reorganised to add the WLED bridge entry and surface mDNS / X11 specifics under the relevant docs lines.
- **`download.astro`** — Linux asset note `AppImage · experimental` → `AppImage · deb · rpm` to match the v1.5.1+ three-installer-per-release pipeline.

### Pre-deploy patches now live

The four PRs merged into `main` after v1.1.7 but never tagged are now part of v1.1.8 (`deploy.yml` is release-driven, not push-driven):

- **`fix(security)` Sentinel**: `community.astro` now wraps `triage[i].a` in `DOMPurify.sanitize()` before the `<dd set:html>` injection. Closes a latent XSS surface that would have activated if the hardcoded `triage` array ever became dynamic.
- **`feat(a11y)` Palette**: Pagefind `.search-result` links get a `:global(.search-result:focus-visible)` outline + `outline-offset` so keyboard users see a visible focus ring on dynamically-injected DOM. Astro's scoped CSS otherwise ignored the rule.
- **`chore(deps)` Dependabot**: Astro 6.1.9 → 6.2.1, marked 18.0.2 → 18.0.3, @astrojs/check 0.9.8 → 0.9.9, prettier-plugin-tailwindcss 0.7.3 → 0.8.0.
- **`chore(deps)` Dependabot**: pnpm/action-setup SHA pin refreshed (`903f9c1` → `8912a91`), tracking the upstream v6.0.3 → v6.0.5 release.

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
