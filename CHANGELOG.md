# Changelog — lumasync-site

This is the changelog for the **marketing/docs site** at lumasync.app. The LumaSync app's own release notes live in the app repo and surface on [/changelog](https://lumasync.app/changelog/) — site versions track independently from app versions.

The site follows [Semantic Versioning](https://semver.org/) at its own cadence; bumping the LumaSync app submodule does not require bumping the site version.

## [1.1.49] — 2026-10-14

### Changed

- **The footer names the person behind LumaSync.** It now ends with "Made by Samet Özkan", linking to the author's site with `rel="author"`; `humans.txt` names the maintainer too.

### SEO

- **The Organization schema's founder is the author, not just a handle.** `founder` now carries the author's name, site, LinkedIn and the same `@id` the author's own site uses.

### Security

- **Three high-severity advisories in transitive dependencies are cleared.** `overrides` floors for `sharp`, `http-cache-semantics` and `source-map-js` close GHSA-wq5f-xc86-pv6w, GHSA-ch52-4w7c-c8xp and GHSA-68fv-2mgg-jv7q.

### Build

- **Bun 1.4.3.** `packageManager` moves from 1.4.2 to 1.4.3.

## [1.1.48] — 2026-09-25

### Fixed

- **The homepage roadmap no longer promises Wayland capture for v1.6.** The item now says no release is committed for it.
- **The screen-capture page names the libraries the Linux packages actually carry.** It now lists GTK 3, WebKitGTK 4.1, `libudev` and `libdbus` as bundled, `libxcb` from the system, and points to the install page.

### Changed

- **`Last-Modified` reflects this release.**

## [1.1.47] — 2026-09-25

### Fixed

- **Structured-data dates are full datetimes.** `datePublished` and `dateModified` on the homepage and comparison pages now carry a UTC time instead of a bare date.
- **The `SoftwareApplication` node's `@id` carries the trailing slash.**

### Changed

- **`Last-Modified` reflects this release.**

## [1.1.46] — 2026-09-25

### Fixed

- **The ambient-mode callout shows ambient mode.** It had reused the full-mode screenshot; it is now a crop of the real edge-signal panel from the hero screenshot.
- **No invented telemetry over the screenshot.** The static `Δ 12 ms · Σ 60 fps` overlay is gone.
- **The install page names the libraries the AppImage actually ships.** GTK 3, WebKitGTK 4.1, `libudev` and `libdbus` are bundled; `libxcb` comes from the system, and `libpipewire` is not included.
- **Image alt text describes the image.** The ambient and full-mode screenshots had alts naming things their images did not show.

### Changed

- **`Last-Modified` reflects this release.**

## [1.1.45] — 2026-09-25

### Fixed

- **Wayland is described the way the app actually behaves.** The screen-capture, multi-display and install docs and the homepage Linux card now say Wayland is not a supported capture path; use an X11 session.
- **`llms.txt` no longer names a config file the app does not write.** Its config-reference entry now names `shell-state.json` instead of `~/.config/lumasync/app.json`.
- **`robots.txt` enforces its own `ai-train=no`.** `ClaudeBot` and `Applebot-Extended` are now disallowed, `Claude-SearchBot` is allowed by name, and the retired `anthropic-ai` token is removed.
- **`robots.txt` passes Lighthouse's validity audit.** The `Content-Usage` line is removed; `Content-Signal` stays.
- **`/favicon.ico` exists.** It is now built from the 16/32/48 brand SVGs and linked alongside the SVG favicon.
- **The search button's accessible name contains its visible label.** Lighthouse's label-in-name audit flagged `aria-label="Open search"` against the visible `⌘K`.

### Changed

- **Homepage screenshots are served at the size they are displayed.** They now render through `astro:assets` as responsive WebP srcsets with PNG fallbacks under `/_astro/`.
- **Descriptions fit the snippet.** Five page descriptions and two docs-group ledes were trimmed to 160 characters or fewer.
- **`mask-icon` is gone** — Safari's pinned-tab icon.
- **`Last-Modified` reflects this release.**

## [1.1.44] — 2026-09-21

### Changed

- **Bun replaces pnpm as the package manager; the site it builds is unchanged.** `bun.lock` replaces `pnpm-lock.yaml`, and security floors move to the top-level `overrides` key.
- **The CVE gate now covers dev dependencies too.** CI runs `bun audit`, the licence gate uses `bun pm licenses --prod`, and Dependabot tracks the `bun` ecosystem.
- **`Last-Modified` reflects this release.**

## [1.1.43] — 2026-09-21

### Fixed

- **The homepage has a title longer than its own brand name.** It now reads `LumaSync — Ambilight for Philips Hue, WLED and WS2812B`.
- **The homepage description fits the snippet.** The rewritten 146-character version leads with "Local-only, brand-agnostic, MIT-licensed".
- **`/sitemap.xml` answers instead of 404ing.** It now 301-redirects to `sitemap-index.xml`.

### Changed

- **`Last-Modified` reflects this release.**

## [1.1.42] — 2026-09-21

### Fixed

- **Legacy aliases resolve in one edge 301 instead of two hops.** All thirteen redirect aliases moved from Astro's `redirects` map to `public/_redirects`.
- **The six docs group hubs have OG cards instead of a 404.** `/docs/getting-started/`, `/docs/hue/`, `/docs/usb-leds/`, `/docs/ambilight/`, `/docs/advanced/` and `/docs/reference/` now have their own cards.
- **`X-Markdown-Tokens` no longer reports `0` on a HEAD request.** It falls back to `Content-Length`, or is omitted when neither a body nor a length is available.

### Changed

- **`Last-Modified` reflects this release.**

## [1.1.41] — 2026-09-21

### Fixed

- **The site stopped claiming analytics it does not run.** The privacy notice, [telemetry reference](https://lumasync.app/docs/reference/telemetry/) and `llms.txt` now say lumasync.app collects nothing; the Umami wiring is described as dormant.
- **Every external footer link carries `rel="noopener noreferrer"`, not just the tracked ones.**
- **`fflate` is floored at 0.7.5, closing [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98).** The override is capped below 0.8.0.

### Changed

- **Dependencies moved to latest stable, with three deliberate exceptions.** Astro 7.3.3, `@astrojs/mdx` 8.0.1 (major), `@astrojs/sitemap` 3.7.4, Satori 0.33.4, `marked` 18.0.13, DOMPurify 3.4.15, `isomorphic-dompurify` 4.3.0 (major), Prettier 3.9.8 and `pnpm/action-setup` 6.1.0; held: TypeScript 6.x, `prettier-plugin-astro` 0.14.1, `@astrojs/language-server` 2.16.13.

## [1.1.40] — 2026-08-20

### Fixed

- **The docs stop describing behaviour the app does not have.** WLED mDNS auto-discovery, the `app.json` config file and the Wayland figures on the [performance](https://lumasync.app/docs/ambilight/performance/) page are gone; the [config-file reference](https://lumasync.app/docs/reference/config-file/) now documents `shell-state.json`.
- **Privacy and telemetry now agree on where the Hue credential lives.** It is in the OS keychain.
- **`Last-Modified` reflects this release.** The `updated:` dates on the thirteen corrected pages do too.

### Changed

- **`sanitizeUrl` in the search component returns the parser's own output** rather than validating one string and handing back another.
- **Dependencies:** Astro 7.2.0 → 7.2.2.

## [1.1.39] — 2026-08-11

### Fixed

- **The install guide now describes the first launch that actually happens.** It covers macOS's System Settings → Privacy & Security → Open Anyway step and the Windows SmartScreen and Smart App Control prompts.
- **"Signed" no longer means two different things on the same page.** The Windows section now says the MSI carries only a minisign signature for the updater, not Authenticode.
- **Inline links, code spans, and emphasis no longer swallow the space before them.** Fifteen places across the site rendered words run together, such as "standardCode of Conduct".
- **The `/compare` listing heading uses the sans-serif page title** like every other listing page.

### Changed

- **System requirements read macOS 12.3, matching the app.** Corrected in the install guide, the USB controller driver notes and the FAQ schema.
- **The Flathub package is no longer promised.** The landing page roadmap lists Wayland capture via `xdg-desktop-portal` in its place.

## [1.1.38] — 2026-08-10

### Added

- **Hue Bridge Pro is documented as a supported bridge.** A new Bridge Pro section on [Hue pairing](https://lumasync.app/docs/hue/pairing/) and an entry on [Hue troubleshooting](https://lumasync.app/docs/hue/troubleshooting/) cover v1.5.4's HTTPS-first pairing.

### Changed

- **The Hue pairing error table no longer under-describes the link-button case.** The pairing and troubleshooting pages now say how v1.5.3 and v1.5.4 each report a rejected link button.
- **The outbound-call table on the [Telemetry](https://lumasync.app/docs/reference/telemetry/) page reflects the real bridge transport.** It now reads HTTPS with HTTP fallback.
- **Manual-IP guidance records the readiness-check guard.** v1.5.4 rejects loopback, multicast and broadcast addresses before the Hue stream-readiness probe connects.
- **Room map editor notes extended for v1.5.4** — accessible names on context-menu entries and a faster object drag.

### Fixed

- **The landing page's "Shipped" roadmap column no longer mislabels itself on a submodule bump.** Its bullets now describe v1.5.4, including Bridge Pro pairing and RUSTSEC-2026-0235.

## [1.1.37] — 2026-08-10

### Security

- **The `fast-uri` override no longer pins the toolchain to a vulnerable release.** The floor moves to `^3.1.5`, closing GHSA-7p8r-x3mc-p8w7 in this development-only dependency.
- **Dependabot's security update for `fast-uri` can complete again.**

## [1.1.36] — 2026-08-10

### Security

- **Two high-severity CVEs in the shipped dependency tree are closed.** `js-yaml` resolves to 4.3.1 (GHSA-5p4m-2wfm-xmqj) and `nanoid` to 3.3.18 (GHSA-2v37-7h3g-55p8).
- **Transitive override floors raised to match the new advisories.** `js-yaml` moves to `^4.3.1` and `nanoid` joins at `>=3.3.17`.

### Fixed

- **The site-wide `Last-Modified` freshness signal is current again.** It had been left at 26 Jun 2026 across v1.1.34 and v1.1.35.

### Dependencies

- **Minor/patch group bump across four packages** — `astro` 7.2.0, `marked` 18.0.9, `dompurify` 3.4.13, `isomorphic-dompurify` 3.22.0.

### CI

- **`pnpm/action-setup` pinned forward from v6.0.9 to v6.0.10** in both the CI and deploy workflows.

## [1.1.35] — 2026-07-29

### Security

- **Four high-severity CVEs in the shipped dependency tree are closed.** `js-yaml` (GHSA-52cp-r559-cp3m), `svgo` (GHSA-2p49-hgcm-8545), `sharp` (GHSA-f88m-g3jw-g9cj) and `postcss` (GHSA-r28c-9q8g-f849) are pinned to patched ranges via `pnpm.overrides`.

### Fixed

- **TV sizes in the hardware checklist use a real prime mark.** The opening quote on the USB controllers page heading renders correctly again too.

### Dependencies

- **Astro 7.1.5 and `@astrojs/mdx` 7.0.5 (majors, bringing Vite 8), plus an 11-package minor/patch group** including `satori` 0.29, Tailwind 4.3.3 and `@fontsource` 5.3.0; TypeScript held at 6.0.3.

### CI

- **`actions/setup-node` pinned forward from v6 to v7** in both the CI and deploy workflows.

## [1.1.34] — 2026-07-14

### Fixed

- **Press-state feedback on inline links now actually renders.** The 404 page's home link and the `/download/` version pill now visibly press on `:active`.

### Accessibility

- **The landing page's `.inline-cta` links press like the site's other CTAs.**

### Dependencies

- **Minor/patch group bumps across two batches** — `tailwindcss` and `@tailwindcss/vite` 4.3.2, `marked` 18.0.6, `dompurify` 3.4.12, `prettier` 3.9.5.

## [1.1.33] — 2026-06-29

### Added

- **`Content-Usage` AI-preference signal in `robots.txt`.** The IETF AIPREF directive `Content-Usage: search=y, train-ai=n` now sits alongside the existing `Content-Signal`.
- **Web Bot Auth directory placeholder.** `/.well-known/http-message-signatures-directory` now serves an empty JWKS as `application/json`.

### CI

- **Lighthouse CI pinned to `@lhci/cli@0.15.1`** instead of `@latest`.

## [1.1.32] — 2026-06-29

### Security

- **Pagefind stamp script no longer has a check-then-act file race.** It now opens and appends to each file through one descriptor, resolving the CodeQL `js/file-system-race` alert.

## [1.1.31] — 2026-06-29

### Security

- **Pagefind search results now scheme-validate their link URLs.** A `sanitizeUrl()` guard allows only `http:` and `https:` result links, falling back to `#`.

### Accessibility

- **The `/download/` version pill reads and behaves as the link it is.** It gains hover, focus-visible and press states and a descriptive `title`.

### Dependencies

- **Dev-only `prettier` bump 3.8.4 → 3.9.1.**

## [1.1.30] — 2026-06-26

### Fixed

- **Cmd+K search now actually loads its WebAssembly — Pagefind core JS is cache-busted per deploy.** Each build stamps `pagefind.js`, `pagefind-worker.js` and `pagefind-ui.js` so the edge serves the current CSP.

## [1.1.29] — 2026-06-25

### Changed

- **Landing roadmap "Shipped" column scoped to the current release.** It now lists only v1.5.3 highlights, with the full history under "Full changelog →".

## [1.1.28] — 2026-06-25

### Fixed

- **Cmd+K search restored.** The CSP `script-src` now includes `'wasm-unsafe-eval'`, so Pagefind can load its WebAssembly again.

### Build

- **Pinned the `vendor/lumasync` submodule to the v1.5.3 release commit**, so the site and `/changelog/` show v1.5.3.

## [1.1.27] — 2026-06-25

### Documentation

- **Synced docs to LumaSync app v1.5.3.** Adds the macOS launch-crash note, the Hue active-streamer and "Retry Stop" fixes, and the v1.5.3 hardening and performance changes.

### Content

- **Landing page refreshed for v1.5.3.** The roadmap "Shipped" column and the macOS platform card now lead with the v1.5.3 launch-crash fix.

### Accessibility

- **Focus-visible rings on landing-page text links** — inline CTAs, feature-grid "→" links and trust-section links. Incorporates community PR #103.

### SEO

- **Bumped the site-wide `Last-Modified` freshness signal.**

## [1.1.26] — 2026-06-22

### Security

- **External-link `noopener` rollout finished on render-time links**: the 404 recovery links, `/community/` FAQ answers and forum cards, and `/download/` asset cards now set `rel="noopener noreferrer"`.

### Accessibility

- **Skip-to-content link gains a visible focus ring and press feedback.**
- **404 page recovery links respond to keyboard focus** with the standard `:focus-visible` outline.

### Dependencies

- **Minor/patch group bump (3 updates)**: `astro` 6.4.8, `dompurify` 3.4.11, `isomorphic-dompurify` 3.18.0.

### Build

- **GitHub Actions bumps**: `actions/checkout` 7 and `pnpm/action-setup` 6.0.9 across the workflows.

## [1.1.25] — 2026-06-15

### Security

- **esbuild advisory cleared (GHSA-gv7w-rqvm-qjhr, GHSA-g7r4-m6w7-qqqr)**: an `overrides` entry pins `esbuild` to `>=0.28.1`.
- **`yaml` advisory cleared (GHSA-48c2-rrv3-qjmp)**: an `overrides` entry forces `yaml` to `>=2.8.3`.
- **External-link hardening completed site-wide**: `rel="noopener noreferrer"` now covers the remaining outbound links on the home, download and community pages.

### Accessibility

- **Disabled community forum links show their tooltip on hover.**

### Dependencies

- **`astro` 6.4.4 → 6.4.7**, plus in-range patches across the lockfile.

## [1.1.24] — 2026-06-09

### Security

- **CSP `img-src` no longer allows arbitrary HTTPS origins**: it is now `img-src 'self' data:`.
- **External outbound links carry `rel="noopener noreferrer"`** in `CompareCTA.astro`, the footer, `/changelog/` and `/license/`.

## [1.1.23] — 2026-06-08

### Build

- **Declared Node engine floor aligned to the real requirement**: `engines.node` is now `>=22.12.0`, and the README says "Node 22.12+".

## [1.1.22] — 2026-06-08

### Accessibility

- **Keyboard focus rings on call-to-action buttons** in `CompareCTA.astro` and on the homepage.
- **Compare-listing grid cards respond to keyboard focus and press** on the `/compare/` index.

### Dependencies

- **`@astrojs/mdx` 6.0.2 (major), plus a minor/patch group**: `astro` 6.4.4, `marked` 18.0.5, `dompurify` 3.4.8, `isomorphic-dompurify` 3.16.0.

## [1.1.21] — 2026-06-01

### Accessibility

- **Disabled Discord card explains itself on hover**: the "Coming soon" card on `/community/` now shows a "Pending community growth" tooltip.

### Dependencies

- **Minor/patch group bump (4 updates)**: `astro` 6.4.2, `@astrojs/sitemap` 3.7.3, `dompurify` 3.4.7, `isomorphic-dompurify` 3.15.0.

## [1.1.20] — 2026-05-29

### Security

- **Response-header hardening**: the deprecated `block-all-mixed-content` CSP directive is gone, and a `Permissions-Policy` now denies camera, microphone, geolocation, payment, USB, motion sensors and the Topics API.

### Structured Data

- **Organization logo dimensions corrected** to `320x80`, matching `brand/logotype-light.svg`.

## [1.1.19] — 2026-05-29

### Bug Fixes

- **Dead links in `llms.txt` and slashless structured-data URLs**: `llms.txt` links to `llms-full.txt` and `security.txt`, and docs schema URLs, now resolve directly, without 404s or redirects.
- **`/docs/` and `/compare/` hub OG images 404'd**: both hubs now have OG cards.
- **`SoftwareApplication` declared one `@id` with two download URLs**: both now point to `/download/`.
- **`humans.txt` named the wrong host**: corrected to Cloudflare Pages.

### Content

- **Hue Sync comparison repositioned**: `/compare/hue-sync/` no longer says the desktop app was discontinued and presents LumaSync as a free, open-source alternative.

### Accessibility

- **Muted text now meets WCAG AA contrast**: `--text-muted` is now `#8b919c`.
- **Disabled download cards explain themselves on hover** with a "No release available for this platform yet" tooltip.

### Performance

- **Long-lived caching for `/media/`**: hero and screenshot images now carry a 30-day `Cache-Control`.

### Discoverability

- **Markdown entry-point `Link` relation**: the `Link:` header for `llms.txt` / `llms-full.txt` now uses `rel="alternate"; type="text/markdown"`.

### Build

- **CI gates on production CVEs**: a `pnpm audit --prod --audit-level=high` step fails the build on a high-severity advisory.

## [1.1.18] — 2026-05-29

### Security

- **Sanitized GitHub API fetch errors on `/download/`**: a failed release fetch now shows a generic "upstream API unavailable" message instead of the raw error.

### Accessibility

- **Search-hint `<kbd>` glyphs hidden from the accessible name in `Search.astro`**: screen readers now hear "Up and down arrows" and "Enter" instead of raw symbols.

### Interaction

- **Press-state feedback on search results**, respecting `prefers-reduced-motion`.

## [1.1.17] — 2026-05-27

### Security

- **CSP hardening — `https:` wildcard removed from `script-src` and `connect-src`**: both directives are now `'self'`.

### Accessibility

- **`aria-keyshortcuts` + dialog-popup semantics on search triggers**: screen readers announce the shortcut instead of reading "⌘K", and the Close button exposes `Escape`.
- **Focus-visible outline on `/`'s compare cards.**

### Dependencies

- **Minor/patch group bump (4 updates)**: `astro` 6.3.7, `marked` 18.0.4, `dompurify` 3.4.5, `isomorphic-dompurify` 3.14.0.

## [1.1.16] — 2026-05-20

### Bug Fixes

- **Stale search queries no longer overwrite fresher results in `Search.astro`.**

### Accessibility

- **Disabled download cards on `/download/` now drop their `href` entirely**, so they leave the keyboard tab order.

### Dependencies

- **Minor/patch group bump (4 updates)**: `astro` 6.3.3, `@astrojs/mdx` 5.0.6, `dompurify` 3.4.4, `isomorphic-dompurify` 3.13.0.
- **GitHub Actions**: `pnpm/action-setup` 6.0.8 and `cloudflare/wrangler-action` 4.0.0 (major), both pinned by commit SHA.

## [1.1.15] — 2026-05-16

### Accessibility

- **Disabled forum cards on `/community/` now drop their `href` entirely**, so they leave the keyboard tab order and Enter does nothing.

### UX

- **Focus-visible outline + tactile click feedback on `/community/` forum cards**, excluding disabled cards.

### Performance

- **Manual indexed loops in `pickAsset` on `/download/`** replace a per-asset closure at build time.

## [1.1.14] — 2026-05-15

### Dependencies

- **`devalue` bumped 5.8.0 → 5.8.1**: a transitive Astro dependency, picking up an upstream sparse-array memory fix.

## [1.1.13] — 2026-05-14

### Security

- **Single-quote escape in Pagefind result rendering**: `escapeHtml` in `Search.astro` now also escapes `'`.

### Performance

- **Cached Pagefind init Promise + O(1) keyboard navigation in `Search.astro`**: Pagefind initializes once, and arrow keys update only the two affected results.

### UX

- **Tactile click feedback + focus ring on download installer cards** on `/download/`.
- **Focus-visible + active states on `DocsSidebar.astro` links.**

### CI

- **`pnpm/action-setup` bumped 6.0.5 → 6.0.6.**

## [1.1.12] — 2026-05-09

### Security

- **Content-Security-Policy header on all responses**: `public/_headers` now sets a restrictive-by-default baseline CSP under `/*`.

### Performance

- **Cached focus-trap NodeList in `Header.astro`**: the mobile-nav focus trap queries focusable elements once per open, not on every Tab.

### UX

- **Tactile click feedback on landing-page CTAs and comparison cards**, respecting `prefers-reduced-motion`.

## [1.1.11] — 2026-05-07

### Security

- **Single-quote escape in JSON-LD serialization**: `Schema.astro` now also escapes `'` as `'`.

### UX

- **Tactile click feedback on 404 page CTAs**, respecting `prefers-reduced-motion`.

## [1.1.10] — 2026-05-06

### SEO

- **Internal-link canonicalization across the URL surface.** Every internal link, schema URL, redirect target and `llms.txt` URL now carries the trailing slash, so none hit a 308.
- **`Header.astro` `isActive` simplified** to `pathname.startsWith(href)`.

## [1.1.9] — 2026-05-05

### Security

- **DOM-based XSS in Pagefind search results**: excerpts are now HTML-escaped, keeping only Pagefind's `<mark>` highlighting.

### Accessibility

- **Native tooltips on icon-only buttons**: the search trigger, mobile nav buttons and search modal close button now carry `title` attributes.
- **Tactile click feedback** on the same controls, respecting `prefers-reduced-motion`.

## [1.1.8] — 2026-05-05

### Content

- **App v1.5.0 + v1.5.1 + v1.5.2 surfaced on the site.** The site now reports `v1.5.2 — 2026-05-05` across landing copy, structured data, `llms.txt` and docs.
- **Landing page roadmap shift**: "Shipped" now shows v1.5.2 highlights, and "Next" becomes "v1.6 — queued".
- **Linux platform support**: promoted from "Experimental" to "Supported", with AppImage, deb and rpm downloads.
- **Three-sink narrative**: the feature grid and hero now present USB, WLED and Philips Hue together.

### Docs

- **New `docs/usb-leds/wled.mdx`** — the WLED bridge reference: DDP over UDP, mDNS auto-discovery, manual IP, validation errors and network checklist.
- **`getting-started/install.mdx`** rewrote — three Linux installers, stable Windows MSI, and X11 capture dependencies.
- **`getting-started/first-setup.mdx`** — adds the onboarding banner, close-to-tray notification, WLED pairing step and chip-type selector.
- **`getting-started/hardware-checklist.mdx`** — corrects the WS2812B/SK6812 mix-up, lists six USB chipsets, and adds a WLED path.
- **`usb-leds/controllers.mdx`** — six chipsets, `PORT_UNSUPPORTED` filtering and the strip-chip selector.
- **`usb-leds/serial-protocol.mdx`** — adds WS2812B and SK6812 RGBW chip types to the wire format.
- **`usb-leds/calibration.mdx`** — numeric keyboard input for edge counts and stand-gap, new design tokens, and a Hue Zones link.
- **`usb-leds/troubleshooting.mdx`** — adds the `PORT_UNSUPPORTED` failure mode.
- **`hue/pairing.mdx`** — mDNS-first discovery and **bridge username + PSK now stored in the OS keychain**.
- **`hue/entertainment-area.mdx`** — new "Hue Zones" and "Per-bulb gamut clipping" sections.
- **`hue/troubleshooting.mdx`** — `HUE_STREAM_NOT_READY_ACTIVE_STREAMER` noted as retired in v1.5.2.
- **`advanced/auto-updater.mdx`** — documents the beta update channel.
- **`advanced/multi-display.mdx`** — Linux hot-plug via xcap RandR events, with XWayland fallback.
- **`ambilight/screen-capture.mdx`** — Linux X11 capture via xcap as the default Linux path.
- **`reference/telemetry.mdx`** — adds mDNS and WLED network calls and corrects Hue credential storage to the OS keychain.
- **`reference/notifications.mdx`** — adds `wled.connected`, the close-to-tray notification, the macOS template tray icon and the log bridge.
- **`reference/shortcuts.mdx`** — notes the unified quit path and adds a "Compact-mode deep links" section.
- **`reference/error-handling.mdx`** — new "macOS lifecycle hardening (v1.5.2)" section.
- **`reference/config-file.mdx`** — adds `schemaVersion`, `updateChannel`, `wled.targets` and zone-aware `roomMap`, and notes Hue credentials live in the keychain.
- **`compare/wled.mdx`** — reframed: LumaSync now drives WLED natively over DDP, so the page recommends using them together.

### Discoverability

- **`public/llms.txt`** — summary and docs list updated for USB, WLED over Wi-Fi and keychain credentials.
- **`download.astro`** — Linux asset note now reads `AppImage · deb · rpm`.

### Pre-deploy patches now live

Changes merged after v1.1.7 that ship with this release:

- **`fix(security)`**: `community.astro` now sanitizes triage answers with `DOMPurify.sanitize()` before injecting them.
- **`feat(a11y)`**: Pagefind search results show a visible focus ring.
- **`chore(deps)` Dependabot**: Astro 6.2.1, marked 18.0.3, @astrojs/check 0.9.9, prettier-plugin-tailwindcss 0.8.0.
- **`chore(deps)` Dependabot**: `pnpm/action-setup` v6.0.5.

## [1.1.7] — 2026-05-02

### Security

- **Markdown→HTML XSS hardening**: `/changelog/` now passes the parsed app changelog through `DOMPurify.sanitize()` before rendering it.

## [1.1.6] — 2026-05-01

### Fixed

- **`/security` URL alias**: `/security` and `/security/` now 301 to `/.well-known/security.txt`.

## [1.1.5] — 2026-05-01

### SEO

- **Per-URL sitemap `lastmod`**: each sitemap URL now carries its source file's last git commit date, or no `lastmod` when there is no clear source.

## [1.1.4] — 2026-05-01

### Accessibility

- **Keyboard focus indicators** on the search modal close button and the 404 page's search button.

## [1.1.3] — 2026-04-30

### Security

- **JSON-LD script-breakout XSS**: `Schema.astro` now escapes `<`, `>` and `&`, and `Search.astro` escapes result URLs.

## [1.1.2] — 2026-04-30

### Performance

- **OG image I/O**: font and content loads in `src/pages/og/[...route].ts` now run in parallel.

### Security

- **Security headers**: added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Strict-Transport-Security` to `public/_headers`.

## [1.1.1] — 2026-04-27

### Fixed

- **Favicon**: `public/favicon.svg` redrawn on a 64×64 viewBox with a heavier stroke for legibility at 16×16.
- **PNG favicon fallbacks**: `/favicon-32.png` and `/favicon-192.png` added and linked from the page head and webmanifest.
- **Release notes wrap**: `CHANGELOG.md` now uses one line per bullet, so GitHub Releases no longer breaks bullets mid-line.

### Documentation

- **`CHANGELOG.md`**: internal figures removed from the v1.1.0 entry.

## [1.1.0] — 2026-04-27

### Added

- **Section index pages** for all six docs groups (`/docs/getting-started/`, `/docs/hue/`, `/docs/usb-leds/`, `/docs/ambilight/`, `/docs/advanced/`, `/docs/reference/`).
- **SoftwareApplication** JSON-LD schema on the homepage, not just `/download/`.
- **Article** JSON-LD schema on each compare leaf (`/compare/wled/`, `/compare/hue-sync/`, `/compare/hyperion/`, `/compare/prismatik/`).
- **"See how LumaSync compares"** section on the homepage with four cards linking to the comparison pages.
- **`## Disambiguation`** section in `llms.txt` listing what LumaSync is _not_, mirrored on the homepage compare CTA.
- **11 search-intent redirect aliases**: `/quick-start`, `/docs/getting-started/quick-start`, `/led-calibration`, `/docs/concepts/led-calibration`, `/hue-pairing`, `/hue-entertainment`, `/usb-setup`, `/serialport`, `/screens`, `/multi-monitor`, `/compare-tools`.
- **Sublede paragraph** on `/compare/` naming the four alternatives.

### Changed

- **`trailingSlash: 'always'`** in `astro.config.mjs` (was `'never'`), so sitemap and canonical URLs end with `/`.
- **`Organization` schema** extended with `description`, `alternateName`, `slogan`, `keywords`, `founder` and broader `sameAs`.
- **`SoftwareApplication.operatingSystem`** is now an array instead of a comma-joined string.
- **H2 heading rewrites** on the install, hardware-checklist, controllers, tuning and shortcuts docs, such as Prerequisites → System requirements.
- **MDX H2 anchors for direct linking**: "Quick start" on first setup and "LED calibration" on calibration.
- **Landing-page meta-tag rewrites**: new titles and descriptions for `/download/`, `/community/` and `/changelog/`.
- **Section-index ledes** strengthened for `hue/` and `ambilight/`.
- **`LAST_MODIFIED` middleware constant** now bumped on content-edit deploys, not only app releases.
- **`updated:` frontmatter** bumped to `2026-04-27` on the seven MDX files touched.

### Fixed

- **Sitemap canonical mismatch** — sitemap URLs now match the live URLs, with no 308 redirect.
- **`/docs/<group>/` 404s** — group root paths now resolve to index pages.

### Infrastructure

- **`.gitignore`** adds `.wrangler/`.

## [1.0.0] — 2026-04-21

### Initial launch

- Astro 6 SSG, Cloudflare Pages, custom domain `lumasync.app` with `www → apex` redirect.
- 34 routes: homepage, `/download/`, `/changelog/`, `/community/`, `/license/`, `/privacy/`, `/compare/` index + 4 leaves, `/docs/` index + 19 leaves.
- JSON-LD schemas (Organization, WebSite, Article, ItemList, FAQPage, CollectionPage, BreadcrumbList) across all relevant routes.
- Pagefind static search index, Markdown for Agents content negotiation (`Accept: text/markdown` serves `.md` siblings), `llms.txt` and `llms-full.txt` for AI retrieval grounding.
- robots.txt with Cloudflare Content-Signal directive — training bots blocked, retrieval bots allowed.
