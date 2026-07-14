# Changelog — lumasync-site

This is the changelog for the **marketing/docs site** at lumasync.app. The LumaSync app's own release notes live in the app repo and surface on [/changelog](https://lumasync.app/changelog/) — site versions track independently from app versions.

The site follows [Semantic Versioning](https://semver.org/) at its own cadence; bumping the LumaSync app submodule does not require bumping the site version.

## [1.1.34] — 2026-07-14

### Fixed

- **Press-state feedback on inline links now actually renders.** The 404 page's `.home-cta` and the `/download/` version pill both declared a `prefers-reduced-motion`-gated `transform: scale(0.96)` on `:active` and listed `transform` in their transition — but both are anchors laid out as non-replaced inline boxes, and CSS `transform` does not apply to those. The press animation was silently dead CSS. Both now set `display: inline-block`, so the tactile `:active` treatment shipped for the version pill in v1.1.31 finally takes effect.

### Accessibility

- **The landing page's `.inline-cta` links press like the site's other CTAs.** They gained `display: inline-block`, a `transform` entry in their transition list, and a `prefers-reduced-motion`-gated `scale(0.96)` on `:active` — matching the interaction treatment already carried by the primary/secondary CTAs and the compare cards.

### Dependencies

- **Minor/patch group bumps across two batches** — `tailwindcss` and `@tailwindcss/vite` 4.3.0 → 4.3.2, `marked` 18.0.5 → 18.0.6, `dompurify` 3.4.11 → 3.4.12, `prettier` 3.9.1 → 3.9.5. Manifest + lockfile only, no source change; the prettier-check, type-check, build, and Lighthouse-CI gates pass unchanged.

## [1.1.33] — 2026-06-29

### Added

- **`Content-Usage` AI-preference signal in `robots.txt`.** Alongside the existing Cloudflare `Content-Signal`, the site now also emits the IETF AIPREF standards-track directive (`Content-Usage: search=y, train-ai=n`) — the successor mechanism that updates the Robots Exclusion Protocol (RFC 9309). The AIPREF vocabulary currently defines only `search` and `train-ai`, so the RAG/answer-engine axis stays on `Content-Signal` for now; the policy is unchanged (indexing yes, model training no).
- **Web Bot Auth directory placeholder.** `/.well-known/http-message-signatures-directory` now serves an empty JWKS (`{ "keys": [] }`) as `application/json`. The site makes no signed outbound requests, so it publishes no keys, but the directory's presence satisfies agent-readiness probes (RFC 9421 HTTP Message Signatures).

### CI

- **Lighthouse CI pinned to `@lhci/cli@0.15.1`** instead of `@latest`, so the runner (and its bundled Lighthouse 12.6.1) no longer re-resolves per run and CI stays deterministic. A note flags adding a `categories:agentic-browsing` assertion once `lhci` ships a build bundling Lighthouse ≥ 13.3.0 (the release that made the Agentic Browsing category default).

## [1.1.32] — 2026-06-29

### Security

- **Pagefind stamp script no longer has a check-then-act file race.** The build-time stamper probed each core file with `existsSync()` and then appended to it by path — a time-of-check/time-of-use window (CWE-367) where the file referenced by the name could change between the two operations. It now opens each file once with an `r+` descriptor (which fails closed with `ENOENT` when the file is absent, preserving the "stamp only if present" behaviour) and appends through that descriptor, so the check and the write target the same handle. CodeQL `js/file-system-race` alert resolved.

## [1.1.31] — 2026-06-29

### Security

- **Pagefind search results now scheme-validate their link URLs.** Each result's URL was injected into the result anchor's `href` after HTML-escaping, which neutralizes markup but not a `javascript:` or `data:` scheme — so a poisoned index entry could have executed on click. A `sanitizeUrl()` guard now parses every result URL with the native `URL` constructor (a dummy base preserves relative paths) and allow-lists only `http:`/`https:`, falling back to `#` for anything else, before the existing escape. Defense-in-depth: the index is built from our own content, but search URLs are no longer trusted blindly.

### Accessibility

- **The `/download/` version pill reads and behaves as the link it is.** The pill links to the GitHub release but rendered as a static-looking badge with no interactive affordance. It now inverts colors on `:hover`, draws the standard 2px `--focus-ring` outline on `:focus-visible`, presses with a `prefers-reduced-motion`-gated `scale(0.96)` on `:active`, and carries a descriptive `title` — matching the interaction treatment used elsewhere on the site.

### Dependencies

- **Dev-only `prettier` bump 3.8.4 → 3.9.1** (minor/patch group) — manifest + lockfile only, no source change. The prettier-check, type-check, build, and Lighthouse-CI gates pass unchanged.

## [1.1.30] — 2026-06-26

### Fixed

- **Cmd+K search now actually loads its WebAssembly — Pagefind core JS is cache-busted per deploy.** The v1.1.28 CSP fix (`wasm-unsafe-eval`) was correct at the origin, but Cloudflare had edge-cached `/pagefind/pagefind-worker.js` with the _old_ CSP header; because that file's bytes never change between deploys, conditional revalidation kept returning `304` and serving the stale header — a "Purge Everything" was re-revalidated straight back to it, so search stayed broken. The build now appends a build-unique stamp to Pagefind's non-fingerprinted core JS (`pagefind.js`, `pagefind-worker.js`, `pagefind-ui.js`) so their ETag changes each deploy, forcing a full `200` that ships the current CSP. The search worker can compile its WASM module again.

## [1.1.29] — 2026-06-25

### Changed

- **Landing roadmap "Shipped" column scoped to the current release.** It had been accumulating the full v1.5.0–v1.5.3 feature list (13 bullets), dwarfing the "Next" and "Never" columns and stretching the section well past a screen. It now lists only the latest release's highlights (v1.5.3) — matching the column's version header — so the three columns read at comparable length, with the full history one click away under "Full changelog →".

## [1.1.28] — 2026-06-25

### Fixed

- **Cmd+K search restored.** The Content-Security-Policy `script-src` was missing `'wasm-unsafe-eval'`, so Pagefind could not compile its WebAssembly module and search silently failed with a CSP console error on every page. Added the narrow `'wasm-unsafe-eval'` source — it permits WASM compilation only, not general `eval` — so the search index loads again.

### Build

- **Pinned the `vendor/lumasync` submodule to the v1.5.3 release commit** so the deployed build resolves the v1.5.3 version surfaces (roadmap header, JSON-LD `softwareVersion`, compare cells) and renders the v1.5.3 release notes on `/changelog/` — completing the v1.1.27 app sync.

## [1.1.27] — 2026-06-25

### Documentation

- **Synced docs to LumaSync app v1.5.3.** Added a macOS launch-crash note — the 1.5.2 build crashed on launch on Macs without Xcode, and v1.5.3 fixes it — to the install guide, the error-handling reference, the download page, and USB troubleshooting. Expanded Hue troubleshooting with the self-clearing active-streamer banner, the fixed "Reconnecting" stall, and the `HUE_STOP_TIMEOUT_PARTIAL` "Retry Stop" hint. Documented the v1.5.3 shutdown-hardening continuation, the transient-notice timer-leak fix, the visibility-aware Hue polling and output hot-path optimizations, the room-map template-selector design-token + `aria-label` work, and single-HTTP-client gamut fetching. Bumped `updated:` frontmatter on every touched doc.

### Content

- **Landing page refreshed for v1.5.3.** The roadmap "Shipped" column now leads with the v1.5.3 headline items (macOS launch-crash fix, self-clearing Hue active-streamer banner, shutdown hardening), and the macOS platform card notes the 1.5.2 → 1.5.3 launch-crash fix.

### Accessibility

- **Focus-visible rings on landing-page text links** — the custom inline CTA links (`.inline-cta`), the feature-grid "→" links, and the trust-section links now draw the standard 2px `--focus-ring` outline on keyboard focus, matching the treatment already used on CTAs and cards. Incorporates community PR #103.

### SEO

- **Bumped the site-wide `Last-Modified` freshness signal** so answer engines and AI crawlers see a current date on HTML and markdown responses.

## [1.1.26] — 2026-06-22

### Security

- **External-link `noopener` rollout finished on render-time links**: the 1.1.25 pass hardened the static-`href` outbound links, but missed a handful whose `href` resolves conditionally and so never matched a literal-`href` audit — the 404 page's recovery links (the GitHub "Report a bug" entry), the `/community/` FAQ answers built as inline HTML strings (the `/issues` and `/discussions/ideas` GitHub links) and the "where to go" forum cards, and the `/download/` per-OS asset cards. Each now sets `rel="noopener noreferrer"`, with the attribute guarded the same way as the `href` so internal and disabled links stay untouched. Defense-in-depth plus Referer-header suppression; no `target="_blank"` exists site-wide.

### Accessibility

- **Skip-to-content link gains a visible focus ring and press feedback**: the `.skip-link` already slid into view on focus, but rendered no `:focus-visible` outline once visible. It now draws the standard 2px `--focus-ring` outline with a 2px offset and a `prefers-reduced-motion`-gated `scale(0.96)` `:active` state, matching the interaction treatment used elsewhere on the site.
- **404 page recovery links respond to keyboard focus**: the `.recovery` cards and the `← Home` link on the 404 page now render the standard `:focus-visible` outline (2px `--focus-ring`, 2px offset), so keyboard and switch-device users can see which recovery target holds focus. Mouse users are unaffected.

### Dependencies

- **Minor/patch group bump (3 updates)**: `astro` 6.4.7 → 6.4.8, `dompurify` 3.4.8 → 3.4.11, and `isomorphic-dompurify` 3.16.0 → 3.18.0 — routine upstream patches, manifest + lockfile only, no source change. The build, type-check, and Lighthouse-CI gates pass unchanged.

### Build

- **GitHub Actions bumps**: `actions/checkout` 6 → 7 across the CI, CodeQL, and deploy workflows, and `pnpm/action-setup` 6.0.8 → 6.0.9 (still pinned to its commit SHA with the version comment refreshed). CI-only; no effect on the published site.

## [1.1.25] — 2026-06-15

### Security

- **esbuild advisory cleared (GHSA-gv7w-rqvm-qjhr, GHSA-g7r4-m6w7-qqqr)**: a pnpm `overrides` entry now pins `esbuild` to `>=0.28.1`, resolving the high- and low-severity advisories that reached the build transitively through `@tailwindcss/vite > vite > esbuild`. The dependency-audit CI gate (`pnpm audit --prod --audit-level=high`) is green again.
- **`yaml` advisory cleared (GHSA-48c2-rrv3-qjmp)**: a pnpm `overrides` entry forces `yaml` to `>=2.8.3`, replacing the vulnerable 2.7.1 pulled in transitively via `@astrojs/check`'s language-server chain. With this, `pnpm audit` reports no known vulnerabilities at any severity, production or development.
- **External-link hardening completed site-wide**: `rel="noopener noreferrer"` now covers the remaining outbound links on the home, download, and community pages (Hue developer portal, and the GitHub repo / releases / Code of Conduct / Contributing links), finishing the rollout begun in 1.1.24. The links open in the same tab (no `target="_blank"` site-wide), so this is defense-in-depth plus Referer-header suppression.

### Accessibility

- **Disabled community forum links show their tooltip on hover**: `.forums a.disabled` swaps `pointer-events: none` for `cursor: default`, so the native `title` ("Pending community growth") surfaces on hover for the inert Discord card. The links already render no `href` and guard `:hover`/`:active` styling with `:not(.disabled)`, so there is no interactivity regression.

### Dependencies

- **`astro` 6.4.4 → 6.4.7**: routine upstream patch (manifest + lockfile only), bringing the `addAttribute` invalid-attribute-name hardening and prerendered-error-page origin validation from the 6.4.5–6.4.7 patch line. A full lockfile refresh also picked up the latest in-range patches across the tree.

## [1.1.24] — 2026-06-09

### Security

- **CSP `img-src` no longer allows arbitrary HTTPS origins**: the Content-Security-Policy permitted images from any `https:` origin, but a repo-wide scan confirmed the site loads no external images at all — every image is served first-party or inlined as a `data:` URI. The directive is now `img-src 'self' data:`, so an injected or compromised markup path can no longer exfiltrate data via attacker-controlled image loads.
- **External outbound links carry `rel="noopener noreferrer"`**: the GitHub links in `CompareCTA.astro`, the Footer's outbound column links, and the repo/license links on `/changelog/` and `/license/` now set both hints. The links open in the same tab (no `target="_blank"` exists site-wide), so this is defense-in-depth rather than an active tabnabbing fix, plus it stops leaking the Referer header to the destination.

## [1.1.23] — 2026-06-08

### Build

- **Declared Node engine floor aligned to the real requirement**: `package.json` `engines.node` tightened `>=22.0.0` → `>=22.12.0`, and the README "Develop" note now reads "Node 22.12+", matching the actual floor imposed by Astro 6 and `@astrojs/mdx` 6 (both declare `node >=22.12.0`). No runtime or build-output change — `.nvmrc` already resolves a compliant Node 22.x, so CI was unaffected; this just makes the declared range honest.

## [1.1.22] — 2026-06-08

### Accessibility

- **Keyboard focus rings on call-to-action buttons**: the primary and secondary CTAs in `CompareCTA.astro` and on the homepage now render a visible `:focus-visible` outline (2px `--focus-ring`, 2px offset), so keyboard and switch-device users can see which button holds focus. Mouse users are unaffected — `:focus-visible` only triggers for keyboard-style focus.
- **Compare-listing grid cards respond to keyboard focus and press**: cards in the `/compare/` index grid gain the same `:focus-visible` outline plus a subtle `scale(0.96)` active-press transform, gated behind `prefers-reduced-motion`, matching the interaction feedback already present on the homepage compare cards.

### Dependencies

- **Minor/patch group bump (4 updates)**: `astro` 6.4.2 → 6.4.4, `marked` 18.0.4 → 18.0.5, `dompurify` 3.4.7 → 3.4.8, and `isomorphic-dompurify` 3.15.0 → 3.16.0 — routine upstream patches, lockfile + manifest only, no source change.
- **`@astrojs/mdx` 5 → 6**: major bump of the MDX integration (5.0.6 → 6.0.2). Astro 6.4 satisfies the new `astro: ^6.4.0` peer range; the build, type-check, and Lighthouse-CI gates all pass with MDX-rendered pages unchanged.

## [1.1.21] — 2026-06-01

### Accessibility

- **Disabled Discord card explains itself on hover**: the "Coming soon" Discord card on `/community/` — inert until the active-user count crosses its threshold — now carries a native `title` tooltip ("Pending community growth"), mirroring the disabled download-card treatment from v1.1.19 so hovering users understand why the card is non-interactive. The card was already kept out of the keyboard/click path via `aria-disabled` and an undefined `href`.

### Dependencies

- **Minor/patch group bump (4 updates)**: `astro` 6.3.7 → 6.4.2, `@astrojs/sitemap` 3.7.2 → 3.7.3, `dompurify` 3.4.5 → 3.4.7, and `isomorphic-dompurify` 3.14.0 → 3.15.0. The Astro bump is a minor release; the rest are routine upstream patches — lockfile + manifest only, no source change.

## [1.1.20] — 2026-05-29

### Security

- **Response-header hardening**: removed the deprecated `block-all-mixed-content` directive from the Content-Security-Policy (the `upgrade-insecure-requests` directive, already present, supersedes it), and added a `Permissions-Policy` that denies camera, microphone, geolocation, payment, USB, the motion sensors, and the Topics API. The static site calls no powerful browser APIs, so this is attack-surface reduction with no functional change.

### Structured Data

- **Organization logo dimensions corrected**: the logo `ImageObject` declared `512x128`, but `brand/logotype-light.svg` has an intrinsic `320x80` viewBox. Aligned the declared dimensions (same 4:1 ratio, both above Google's 112px minimum) so strict validators don't flag a mismatch against the asset.

## [1.1.19] — 2026-05-29

### Bug Fixes

- **Dead links in `llms.txt` and slashless structured-data URLs**: the `llms.txt` index linked `llms-full.txt/` and `.well-known/security.txt/` with trailing slashes, which 404 because those are static assets rather than HTML routes — an agent following the index to the full-text corpus or the security contact hit a dead end. Both now point at the slashless forms, and the Telemetry entry resolves to `/docs/reference/telemetry/` instead of the docs index. Separately, the docs leaf (`[...slug]`) and docs group (`[group]/index`) pages emitted their breadcrumb-leaf, TechArticle/HowTo, and CollectionPage schema URLs without a trailing slash, so the structured-data entity URLs 308-redirected instead of resolving directly — they now carry the slash to match the `trailingSlash:'always'` canonical, as do the `llms-full.txt` `Source:` pointers.
- **`/docs/` and `/compare/` hub OG images 404'd**: both hub pages derive an `og:image` URL (`/og/docs.png`, `/og/compare.png`), but the OG generation route had no matching key, so social and crawler unfurls of those two pages rendered without a card. Added both keys.
- **`SoftwareApplication` declared one `@id` with two download URLs**: the homepage and `/download/` both emit the app's `SoftwareApplication` node under the same `@id` but with divergent `downloadUrl` values, asking consumers to merge conflicting nodes. Both now resolve to the stable `/download/` canonical.
- **`humans.txt` named the wrong host**: the credits file listed a stale deploy target; corrected to Cloudflare Pages.

### Content

- **Hue Sync comparison repositioned**: `/compare/hue-sync/` claimed Signify had discontinued the Hue Sync desktop app for PC/Mac, but official Philips release notes show that app is still actively maintained — only the separate Hue Sync mobile app was retired. The page now positions LumaSync as a free, open-source alternative to the desktop app (keeping the migration guidance), and the unresolved editorial placeholder was removed.

### Accessibility

- **Muted text now meets WCAG AA contrast**: `--text-muted` was `#6b7280`, below the 4.5:1 normal-text threshold on the dark surfaces (blockquotes, footer tagline, download meta). Lightened to `#8b919c` while keeping the muted feel.
- **Disabled download cards explain themselves on hover**: unavailable-platform cards now carry a native `title` tooltip ("No release available for this platform yet"), so hovering users understand why the card is inert — the cards were already out of the keyboard/click path from earlier releases.

### Performance

- **Long-lived caching for `/media/`**: hero and screenshot images were served with the 4-hour must-revalidate default; added a 30-day `Cache-Control` block so the LCP hero stops paying a conditional round-trip on repeat visits.

### Discoverability

- **Markdown entry-point `Link` relation**: the RFC 8288 `Link:` header advertising `llms.txt` / `llms-full.txt` now uses `rel="alternate"; type="text/markdown"` — the relation header-only agents key off for markdown discovery — instead of `describedby` / `text/plain`.

### Build

- **CI gates on production CVEs**: added a `pnpm audit --prod --audit-level=high` step so a published vulnerability introduced into the shipped dependency tree fails the build. The existing license audit checks compliance only, not vulnerabilities.

## [1.1.18] — 2026-05-29

### Security

- **Sanitized GitHub API fetch errors on `/download/`**: `src/pages/download.astro` previously surfaced the raw caught error's `.message` directly into the page's `fetchError` state, which could leak upstream API structure, internal request details, or network specifics into the rendered UI. The raw error is now logged server-side via `console.error` for diagnostics, while the user-facing state is pinned to a generic `'upstream API unavailable'` string. No behavioral change for the success path; failed release fetches now degrade with an opaque message instead of an implementation-revealing one.

### Accessibility

- **Search-hint `<kbd>` glyphs hidden from the accessible name in `Search.astro`**: the modal's "Type to search. ↑↓ to navigate, ↵ to open." hint rendered raw arrow and enter symbols that screen readers announced as literal characters. The visual `<kbd>` clusters now carry `aria-hidden="true"` and are paired with `sr-only` text equivalents ("Up and down arrows", "Enter") so assistive technology reads meaningful labels while sighted users keep the compact symbol hint. The same treatment is applied to both the static markup and the `renderEmpty()` JS template that repaints the hint on an empty query, plus the modal Close button's `<kbd>Esc</kbd>` is now `aria-hidden` (the `aria-keyshortcuts="Escape"` already conveys the shortcut semantically).

### Interaction

- **Press-state feedback on search results**: added a `:active` `transform: scale(0.98)` to `.search-result`, gated behind `@media (prefers-reduced-motion: no-preference)` so it respects motion preferences. Gives keyboard and pointer users tactile confirmation when activating a result without affecting reduced-motion sessions.

## [1.1.17] — 2026-05-27

### Security

- **CSP hardening — `https:` wildcard removed from `script-src` and `connect-src`**: `public/_headers` previously shipped `script-src 'self' 'unsafe-inline' https:` and `connect-src 'self' https:`, which let any HTTPS origin execute scripts and accept connections — neutralizing the directives' purpose against XSS / data-exfiltration vectors and effectively trusting the entire HTTPS web. The wildcards are now removed; both directives are pinned to `'self'`. `img-src` keeps `https:` (covers user-agent-honored image fetches and was never the XSS vector). The site already serves no third-party scripts at runtime, so this is a no-op for legitimate traffic and a meaningful narrowing of attack surface.

### Accessibility

- **`aria-keyshortcuts` + dialog-popup semantics on search triggers**: `Header.astro`'s search-trigger button and `404.astro`'s `.search-cta` button render a visual `<kbd>⌘</kbd><kbd>K</kbd>` hint, and screen readers were reading the raw symbol characters as part of the accessible name (e.g. "Open search command K"). Both buttons now expose `aria-keyshortcuts="Control+K Meta+K"` so AT announces the shortcut through the standard accessibility API instead, and the visual `<span class="search-kbd">` / `<span class="kbd">` wrappers carry `aria-hidden="true"` to keep the symbols out of the accessible name. The same buttons also gain `aria-haspopup="dialog"` + `aria-controls="search-dialog"` to advertise the search modal relationship (the existing `<dialog id="search-dialog">` in `Search.astro`), and the modal's Close button picks up `aria-keyshortcuts="Escape"` so the keyboard-dismissal affordance is also surfaced semantically. `404.astro`'s search CTA additionally gains an explicit `aria-label="Search"` to give the button a stable accessible name.
- **Focus-visible outline on `/`'s compare cards**: `src/pages/index.astro`'s `.compare-card` elements had no `:focus-visible` style, so the comparison block was the only landing-page interactive surface without a visible keyboard outline. Added `outline: 2px solid var(--focus-ring)` with a 2px offset matching the focus pattern used across landing CTAs (v1.1.12), 404 controls (v1.1.11), download installer cards (v1.1.13), docs sidebar links (v1.1.13), forum cards (v1.1.15), and download cards (v1.1.16). Closes the last landing-page surface that lacked keyboard parity.

### Dependencies

- **Minor/patch group bump (4 updates)**: `astro` 6.3.3 → 6.3.7, `marked` 18.0.3 → 18.0.4, `dompurify` 3.4.4 → 3.4.5, and `isomorphic-dompurify` 3.13.0 → 3.14.0. Routine upstream patch releases; lockfile + manifest only, no source change.

## [1.1.16] — 2026-05-20

### Bug Fixes

- **Stale search queries no longer overwrite fresher results in `Search.astro`**: the debounced Pagefind input listener fired async work (module load → `pf.search` → `data()` hydration) without tracking which keystroke each result belonged to. A slow earlier query could resolve after a newer one and repaint the result list with stale matches, thrashing layout. Added a monotonic `queryId` captured per input event and re-checked after every `await` boundary — `loadPagefind()`, `pf.search()`, and the `data()` `Promise.all` — so a superseded query bails before touching the DOM. Clearing the input also bumps the id, invalidating any in-flight query.

### Accessibility

- **Disabled download cards on `/download/` now drop their `href` entirely**: `src/pages/download.astro`'s installer-card anchors rendered with a real `href` even when marked `card-disabled`, leaving unavailable-platform cards in the keyboard tab order and activatable with Enter. The href is now conditionally omitted (`href={disabled ? undefined : href}`); without an `href` the `<a>` becomes a non-interactive placeholder, removing it from the focus order. Mirrors the same fix shipped for the community forum cards in v1.1.15.

### Dependencies

- **Minor/patch group bump (4 updates)**: `astro` 6.3.1 → 6.3.3, `@astrojs/mdx` 5.0.4 → 5.0.6, `dompurify` 3.4.2 → 3.4.4, and `isomorphic-dompurify` 3.12.0 → 3.13.0. Routine upstream patch/minor releases; lockfile + manifest only, no source change.
- **`pnpm/action-setup` 6.0.6 → 6.0.8** in both CI and deploy workflows — patch bump, pinned by commit SHA.
- **`cloudflare/wrangler-action` 3.15.0 → 4.0.0** in the deploy workflow — major bump, pinned by commit SHA. Non-breaking for this site because the deploy step already pins `wranglerVersion: '4'`, so the Wrangler binary version is unchanged and the action interface (`apiToken`, `accountId`, `command`) is stable across the major. Also corrected the pin's stale version comment (`# v3.14.0` → `# v4.0.0`) that Dependabot left behind.

## [1.1.15] — 2026-05-16

### Accessibility

- **Disabled forum cards on `/community/` now drop their `href` entirely**: `src/pages/community.astro`'s forum-card anchors previously rendered with `href="#"` + `aria-disabled="true"` + `pointer-events: none` to express the "Coming soon" state. The dummy `#` href left the element in the keyboard tab sequence — focusing the card and pressing Enter would activate the no-op anchor and scroll the page to the top. The href is now conditionally omitted (`href={f.disabled ? undefined : f.href}`); without an `href`, browsers treat the `<a>` as a non-interactive placeholder, naturally removing it from the focus order and disabling Enter-key activation. `aria-disabled` is still set so assistive tech announces the state.

### UX

- **Focus-visible outline + tactile click feedback on `/community/` forum cards**: the same anchors now render an explicit `:focus-visible` outline using `var(--focus-ring)` with a 2px offset, matching the keyboard-affordance pattern shipped on landing CTAs (v1.1.12), 404 controls (v1.1.11), download installer cards (v1.1.13), and docs sidebar links (v1.1.13). The `:active` state scales to `0.96` wrapped in `@media (prefers-reduced-motion: no-preference)`, with `transform` added to the existing transition list so the scale eases at `var(--duration-fast)` rather than snapping. Disabled cards are excluded from both via `:not(.disabled)`. Closes the last remaining navigation surface that lacked tactile / keyboard parity with the rest of the site.

### Performance

- **Manual indexed loops in `pickAsset` on `/download/`**: `src/pages/download.astro`'s `pickAsset` helper resolves GitHub release assets at build time by walking each regex matcher and finding the first asset name that matches. The previous implementation called `assets.find((a) => rx.test(a.name))` inside the matchers loop, allocating a closure per asset on every regex iteration. Replaced the inner `.find()` with a manual indexed `for` loop, eliminating the per-item closure allocation and giving the JIT a flatter control-flow path. Build-time-only — runtime user behavior is unchanged.

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
