# Changelog — lumasync-site

This is the changelog for the **marketing/docs site** at lumasync.app. The LumaSync app's own release notes live in the app repo and surface on [/changelog](https://lumasync.app/changelog/) — site versions track independently from app versions.

The site follows [Semantic Versioning](https://semver.org/) at its own cadence; bumping the LumaSync app submodule does not require bumping the site version.

## [1.1.46] — 2026-09-25

### Fixed

- **The ambient-mode callout shows ambient mode.** Its image was a byte-identical copy of the full-mode screenshot — the app in **Solid** mode, no capture running — under a section headed "Real-time screen capture". It is now a crop of the edge-signal panel from the real hero screenshot: Ambilight active, the capture-to-strip preview with per-edge LED counts, the app's own Δ/Σ reading, and the smoothing, saturation and black-border controls. v1.1.45's move to responsive images surfaced the duplicate, because both files hashed to the same output.
- **No invented telemetry over the screenshot.** A static `Δ 12 ms · Σ 60 fps` pill sat on top of that image as page markup. The panel underneath now carries the app's real reading, so the overlay went rather than contradict it.
- **The install page names the libraries the AppImage actually ships.** It said the AppImage bundles `libxcb`, `libxrandr`, `libpipewire` and `libdbus`. Listing the v1.5.4 AppImage shows no `libpipewire` at all, and the binary links `libxcb.so.1` from the system rather than a bundled copy; GTK 3, WebKitGTK 4.1, `libudev` and `libdbus` are bundled. The sentence now says exactly that.
- **Image alt text describes the image.** The ambient and full-mode screenshots had alts naming things their images did not show.

### Changed

- **`Last-Modified` reflects this release.**

## [1.1.45] — 2026-09-25

### Fixed

- **Wayland is described the way the app actually behaves.** Four surfaces — the screen-capture, multi-display and install docs and the homepage Linux card — said Wayland sessions capture through XWayland, and the screen-capture page presented the portal dialog as a defined fallback. The app's capture source says otherwise: xcap detects a Wayland session itself and falls through to PipeWire / `xdg-desktop-portal`, a path LumaSync neither blocks nor tests. The performance page already said so; the other four now agree with it — Wayland is not a supported capture path, use an X11 session.
- **`llms.txt` no longer names a config file the app does not write.** Its config-reference entry still pointed at `~/.config/lumasync/app.json`, the claim v1.1.40 withdrew from the docs but missed in the hand-written file answer engines read first. It now names `shell-state.json`, matching the reference page.
- **`robots.txt` enforces its own `ai-train=no`.** `ClaudeBot` sat under the retrieval heading and was allowed, but Anthropic documents it as the crawler that collects content for training; citation in Claude runs through `Claude-SearchBot` and `Claude-User`. `Applebot-Extended` was allowed too, and Apple documents it as the opt-out from training its foundation models, one that leaves Apple search inclusion untouched. Both are now disallowed, `Claude-SearchBot` is allowed by name, and the retired `anthropic-ai` token — which looked like coverage and controlled nothing — is gone.
- **`robots.txt` passes Lighthouse's validity audit.** The `Content-Usage` (IETF AIPREF) line was reported as an unknown directive, which failed the `robots-txt` audit and held the SEO category below 100 on both form factors. The drafts are unratified and no crawler is known to read the line, so it was costing a score for a declaration with no effect. `Content-Signal` passes the audit and stays.
- **`/favicon.ico` exists.** It returned 404 to every browser and client that probes the conventional path, and left browsers without SVG favicon support (Safari before 26) on the PNG fallback at best. It is now packed at build time from the pixel-hinted 16/32/48 brand SVGs and linked alongside the SVG.
- **The search button's accessible name contains its visible label.** Lighthouse's label-in-name audit flagged `aria-label="Open search"` against the visible `⌘K`.

### Changed

- **Homepage screenshots are served at the size they are displayed.** Every screenshot shipped as one 1850px file while rendering at 348–578px on desktop and the viewport width on mobile; Lighthouse counted 130 KiB (mobile) to 183 KiB (desktop) of avoidable bytes, the hero — the LCP element — among them. The sources moved to `src/assets/` and render through `astro:assets` with 480–1600w WebP srcsets and PNG fallbacks. They land under `/_astro/` with content-hashed names, so the existing immutable cache rule covers them and the `/media/*` rule went with the directory.
- **Descriptions fit the snippet.** Five page descriptions and two docs-group ledes ran past 160 characters; each was trimmed without changing what it says.
- **`mask-icon` is gone** — Safari's pinned-tab icon, undocumented by Apple for years.
- **`Last-Modified` reflects this release.**

### Not changed, deliberately

- **Critical CSS is not inlined.** Lighthouse lists the two stylesheets as render-blocking. Astro inlines by `vite.build.assetsInlineLimit`, and raising it far enough to cover the homepage stylesheet would also base64 the smaller font subsets into CSS and defeat their preloads.
- **Best Practices is held below 100 by a script this repository does not ship.** Both deprecation warnings come from `/cdn-cgi/challenge-platform/scripts/jsd/main.js`, injected at the edge by Cloudflare's JavaScript Detections, which Bot Fight Mode enables and does not allow switching off. It is a zone setting, not code; a local build without it scores 100.

## [1.1.44] — 2026-09-21

### Changed

- **Bun replaces pnpm as the package manager; the site it builds is unchanged.** `pnpm-lock.yaml` is gone and `bun.lock` takes its place, generated by Bun 1.4.2 migrating the pnpm lockfile rather than re-resolving from scratch — so every installed version stayed where it was, security floors included. Bun does not read `pnpm.overrides`, so the floors moved to the top-level `overrides` key; `fflate` still resolves to `0.7.5`, which matters because an unpinned `fflate` once turned every OG card into a placeholder without failing the build. Bun is the package manager only: Astro, Pagefind and Lighthouse CI still run on Node from `.nvmrc`. Evidence that the output did not move: the built `dist/` has the same file list as the pnpm build, 40 of 40 OG cards render, and a sampled card is byte-identical to the one in production.
- **The CVE gate now covers dev dependencies too.** `pnpm audit --prod` gated only the shipped tree; `bun audit` has no production-only mode, so a high-severity advisory in build tooling now fails CI as well. That is stricter, not looser. A dev-only advisory with no available fix is waived by its GHSA id with `--ignore`, not by dropping the gate. The licence gate keeps its production-only scope through `bun pm licenses --prod`, and Dependabot now tracks the `bun` ecosystem.
- **`Last-Modified` reflects this release.**

## [1.1.43] — 2026-09-21

### Fixed

- **The homepage has a title longer than its own brand name.** `<title>` was `LumaSync` — eight characters, no category term, nothing for a non-brand query to match, and short enough to be a standing invitation for Google to write its own title instead. It now reads `LumaSync — Ambilight for Philips Hue, WLED and WS2812B`: 54 characters, brand first so the brand query still reads cleanly, then the category term the site already uses for itself throughout, then the three sinks the app drives. "Philips Hue" earns its place on measured demand rather than on taste — `hue entertainment area` and `philips hue entertainment area` are the site's highest-impression non-brand queries, and the homepage carried no text matching either. Nothing in the new title is a new claim. `SEO.astro`'s suffix rule moved from a `title === 'LumaSync'` string test to a route check: that test was really asking "is this the homepage", which is why the homepage title could never be anything but the bare brand without doubling into `… · LumaSync`. A substring test would have been wrong — comparison pages carry "LumaSync" in their own titles and keep the suffix.
- **The homepage description fits the snippet.** It was 201 characters against a display limit around 155–160, so `Local-only, brand-agnostic, MIT-licensed` — the positioning, and the part a reader most needs — was cut on every result. The rewritten 146-character version leads with it. `Philips Hue Entertainment areas` is kept in full rather than shortened: that exact phrase is a query the site already receives impressions for, and trading a keyword match for four characters is a bad trade.
- **`/sitemap.xml` answers instead of 404ing.** Nothing was broken — Astro's sitemap integration names the index `sitemap-index.xml`, robots.txt points at it, and Search Console has it submitted and reading successfully. But crawlers and audit tools probe the conventional path by habit. It now forwards with a 301 from `public/_redirects` rather than duplicating the file, so there stays one sitemap with one generator.

### Changed

- **`Last-Modified` reflects this release.**

### Not changed, deliberately

- A GEO audit scores the site's AI-bot posture as three critical failures — `GPTBot`, `CCBot` and `Bytespider` blocked. All three are **training** crawlers, and the tooling's claim that blocking `GPTBot` costs ChatGPT search visibility is wrong per OpenAI's own bot documentation: that is `OAI-SearchBot`'s job. The live `robots.txt` allows every retrieval crawler — `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-User` — so citation visibility is intact and the score is low by choice. Recorded here so the next audit does not read it as a regression and "fix" it.

## [1.1.42] — 2026-09-21

### Fixed

- **Legacy aliases resolve in one edge 301 instead of two hops.** All thirteen entries in Astro's `redirects` map were taking two hops with a meta-refresh as the final step: Astro renders each entry as an HTML page carrying `http-equiv="refresh"`, and `trailingSlash: 'always'` 308s the slashless request before that page is ever reached — `/quick-start` → 308 → `/quick-start/` → meta-refresh → `/docs/getting-started/first-setup/`. The comment above the map claimed this was prevented and had been wrong for as long as it had been there; it addressed the redirect *target's* trailing slash, while the second hop comes from the *source's* missing one. Measured on all thirteen with a hop counter that follows meta-refresh, which `curl -L` does not. The rules move to `public/_redirects`, where this repo already resolves `/security` in a single hop, and where Cloudflare applies them "regardless of whether or not an asset matches the incoming request" — ahead of both the trailing-slash layer and the asset lookup. The stale comment describing an emission that no longer happens is gone, along with the `"/led-calibration/" has no <html> element` build warning those generated pages produced.
- **The six docs group hubs have OG cards instead of a 404.** `/docs/getting-started/`, `/docs/hue/`, `/docs/usb-leds/`, `/docs/ambilight/`, `/docs/advanced/` and `/docs/reference/` each advertised an `og:image` that returned 404 — six of the forty URLs in the sitemap sharing a card that renders blank everywhere it is posted. `SEO.astro`'s `derivedOgPath()` strips the slashes off the pathname, so `/docs/hue/` asks for `/og/docs/hue.png`; the generator keyed every individual doc, every comparison page and both top-level hubs, but never the six group hubs in between, and a missing key produces a request-time 404 rather than a build error. The entries are now derived from `DOC_GROUPS` so a seventh group cannot reintroduce the gap, and `GROUP_LEDE` moved into `src/lib/content.ts` so the card and the page it fronts read from one source rather than two copies. `dist/og/` goes from 34 cards to 40, matching the sitemap exactly.
- **`X-Markdown-Tokens` no longer reports `0` on a HEAD request.** `passThrough()` computed the estimate from `await response.text()` unconditionally, and on a bodyless HEAD response that resolves to an empty string — so the header went out as a confident zero. That is the worst possible wrong value: an agent probes with HEAD precisely to size the fetch before making it, which is the only reason the header exists, and zero says the document is empty rather than "no estimate available". The GET path is untouched and its verified numbers do not move; only the bodyless case falls back to the declared `Content-Length`, and with neither a body nor a length it now sends no estimate at all.

### Changed

- **`Last-Modified` reflects this release.** The middleware constant is bumped alongside the deploy, as the release checklist requires.

## [1.1.41] — 2026-09-21

### Fixed

- **The site stopped claiming analytics it does not run.** The privacy notice, the [telemetry reference](https://lumasync.app/docs/reference/telemetry/) and `llms.txt` all described lumasync.app as collecting aggregate page metrics through self-hosted Umami at `umami.lumasync.app` — down to a field-by-field list of what was recorded per page view. None of it was running. The subdomain is NXDOMAIN, the Pages production environment sets neither `PUBLIC_UMAMI_SITE_ID` nor `PUBLIC_UMAMI_SRC`, so the layout's guard has never been true in production, and the served HTML carries no tracking script of any kind; the site's own CSP (`script-src 'self'`, `connect-src 'self'`) would have blocked the script from that origin regardless. All three surfaces now say the site collects nothing, name Cloudflare's edge traffic data as the only record of a visit, and describe the Umami wiring accurately — present in the source, dormant, gated on two build variables production does not set. `effective:` on the privacy notice is unchanged: the policy did not change, its description of the site was wrong.
- **Every external footer link carries `rel="noopener noreferrer"`, not just the tracked ones.** The attribute was gated on `link.umamiTarget`, so a link's reverse-tabnabbing and `Referer`-leak protection depended on whether someone had remembered to tag it for analytics. The condition now reads the URL itself.
- **`fflate` is floored at 0.7.5, closing [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98).** Satori pulled 0.7.3 transitively — twice — into the shipped tree, where `unzipSync` can spin forever on a malformed ZIP64 archive. Rated moderate, so it sat under the CI audit gate's high threshold and never failed a build; `pnpm audit --prod` now reports no known vulnerabilities at all. The override is capped below 0.8.0 on purpose: an open-ended floor resolves to 0.8.3, which changes how `@shuding/opentype.js` decodes the bundled WOFF fonts and turns **every OG image on the site into rows of tofu boxes** — while the build exits 0, warns about nothing, and writes 28 valid 1200×630 PNGs. Caught by decoding the PNG pixel data and diffing it against a pre-change build.

### Changed

- **Dependencies moved to latest stable, with three deliberate exceptions.** Astro 7.2.2 → 7.3.3, `@astrojs/mdx` 7.0.5 → 8.0.1, `@astrojs/sitemap` 3.7.3 → 3.7.4, Satori 0.29.0 → 0.33.4, `marked` 18.0.9 → 18.0.13, DOMPurify 3.4.13 → 3.4.15, `isomorphic-dompurify` 3.22.0 → 4.3.0, Prettier 3.9.6 → 3.9.8, and `pnpm/action-setup` 6.0.10 → 6.1.0 in both workflows. Held back: **TypeScript stays on 6.x** because `astro check` refuses to run against the 7.x native compiler, which does not yet expose the programmatic API the language server drives — upgrading turns a CI gate into a hard failure with no diagnostics. **`prettier-plugin-astro` stays on 0.14.1** because 1.0.1 does not converge; formatting `src/pages/index.astro` four times in a row produces four different files, so `prettier --check` can never pass against it. **`@astrojs/language-server` is pinned to 2.16.13** through `pnpm.overrides` because 2.17.0 mis-parses the multi-line `set:html` expression in `Schema.astro` and reports five phantom syntax errors on a file `astro build` compiles without complaint.
- **The build output was verified unchanged across the upgrade.** Every emitted file is byte-identical to a pre-upgrade build except the three Pagefind core scripts, which `stamp-pagefind.mjs` rewrites on each build by design, and the sitemap's `lastmod` values, which derive from source-file mtimes.

## [1.1.40] — 2026-08-20

### Fixed

- **The docs stop describing behaviour the app does not have.** Three claims were false against the shipped code. WLED boards were presented as auto-discovered over mDNS by browsing `_wled._tcp.local.` in seven places, while `discover_wled_devices` is a single-IP `/json/info` probe and the only mDNS browser the app registers is Hue's — so the WLED service name was listed on the [Telemetry](https://lumasync.app/docs/reference/telemetry/) page as a LAN request that is never made. The [config-file reference](https://lumasync.app/docs/reference/config-file/) named `app.json` on every platform and `~/.config` on Linux, so the reset instructions told users to delete a file that does not exist; the real file is `shell-state.json` under the XDG data directory, and the wrong name had spread to eleven further pages including the privacy notice. That page's field table was fictional in shape as well, documenting nested `hue.*` / `wled.*` groups and hand-edit advice for keys absent from `ShellState`, two schema versions behind. And the [performance](https://lumasync.app/docs/ambilight/performance/) page published measured-looking figures for a Wayland capture path that is neither implemented nor supported.
- **Privacy and telemetry now agree on where the Hue credential lives.** One page had it in the JSON state file; it has been in the OS keychain since v1.5.0.
- **`Last-Modified` reflects this release.** The middleware constant had been sitting at 10 August while the content underneath it changed, and `updated:` frontmatter on the thirteen corrected pages still claimed dates as old as April — so the JSON-LD `dateModified` that answer engines read was dating a rewritten page to before its rewrite.

### Changed

- **`sanitizeUrl` in the search component returns the parser's own output** rather than validating one string and handing back another. An automated report claimed a `javascript:` bypass through control characters; it does not exist — the WHATWG URL parser strips tab, LF and CR before parsing, exactly as the HTML parser does, and a sweep of every C0 character against a simulation of the browser's `href` pipeline found no input the guard reads as `http:` that the DOM would execute. The shape was tightened anyway, because validate-one-value-return-another is what a real bypass would need.
- **The deploy contract is written down.** `deploy.yml` has fired only on a published release for some time, but the project notes still documented a manual `wrangler` push as the deploy path, which is how this release's content fixes sat merged and unpublished for five days. Merging is now documented as not shipping, with the ad-hoc `workflow_dispatch` path and a verify-by-content step alongside it.
- **Dependencies:** Astro 7.2.0 → 7.2.2.

## [1.1.39] — 2026-08-11

### Fixed

- **The install guide now describes the first launch that actually happens.** LumaSync is not notarized by Apple, so macOS blocks the app on first open and — since Sequoia removed the Control-click override — the user has to go through System Settings → Privacy & Security → Open Anyway. The guide previously jumped straight to the Screen Recording prompt, a step nobody could reach, and any user who searched for help found the Control-click advice that no longer works. Both paths are now written out, and the Windows section documents the SmartScreen "unknown publisher" prompt along with the fact that Smart App Control blocks unsigned installers outright.
- **"Signed" no longer means two different things on the same page.** The Windows section called the MSI signed while the only signature involved is minisign, which the updater uses to verify a download before replacing anything on disk. That is not an Authenticode signature and does not affect the SmartScreen prompt; the page now says so.
- **Inline links, code spans, and emphasis no longer swallow the space before them.** In `.astro`, a newline between text and an inline tag is deleted rather than collapsed, so fifteen places across the landing, license, community, compare, docs and search surfaces rendered as "standardCode of Conduct", "stack),WLED", or "affiliation.Philips Hue". Verified against the built HTML across all pages rather than the source.
- **The `/compare` listing heading uses the sans-serif page title** like every other listing page. `global.css` reserves the serif display face for editorial moments — the landing hero and the individual comparison pages — and the listing was quietly using it.

### Changed

- **System requirements read macOS 12.3, matching the app.** `tauri.conf.json` sets `minimumSystemVersion` to 12.3 while the site said 13+, telling supported users they were unsupported. Corrected in the install guide, the USB controller driver notes, and the FAQ schema that search engines read.
- **The Flathub package is no longer promised.** It is gated on Linux Wayland capture, which does not exist yet, and Flathub review would not favour an X11-only app requesting the broadest device permission available. The landing page roadmap now lists Wayland capture via `xdg-desktop-portal` in its place — the actual prerequisite, and something that can be honestly queued.

## [1.1.38] — 2026-08-10

### Added

- **Hue Bridge Pro is documented as a supported bridge.** The 2025 Bridge Pro serves its local API over HTTPS only, so app builds up to v1.5.3 — whose CLIP v1 pairing, IP-verification, and credential-validation calls were hardcoded to plain HTTP — never reached it, and the failure surfaced as a credentials problem rather than an unreachable endpoint. LumaSync v1.5.4 tries HTTPS first and falls back to HTTP for older firmware. A new **Bridge Pro pairing** section on the [Hue pairing](https://lumasync.app/docs/hue/pairing/) page covers the transport change, a matching symptom-first entry lands on [Hue troubleshooting](https://lumasync.app/docs/hue/troubleshooting/), and the hardware checklist, install prerequisites, and the landing page's hardware FAQ answer all name the Bridge Pro explicitly.

### Changed

- **The Hue pairing error table no longer under-describes the link-button case.** Up to v1.5.3 a rejected link button was rendered as "Auth error — your credentials have expired", pointing users at a credential problem they did not have; v1.5.4 routes it to the awaiting-link-button state. Both the pairing and troubleshooting pages now say which version behaves which way, so a user landing from a search for the old message gets the right answer.
- **The outbound-call table on the [Telemetry](https://lumasync.app/docs/reference/telemetry/) page reflects the real bridge transport.** The row claimed HTTPS 443 while the app was in fact calling HTTP 80; it now reads HTTPS-with-HTTP-fallback, matching v1.5.4, with a note that the request stays on the LAN either way.
- **Manual-IP guidance records the readiness-check guard.** v1.5.4 applies the same IPv4 validation to the Hue stream-readiness probe that the other onboarding endpoints already used, so loopback, multicast, and broadcast addresses are rejected before a connection is attempted — the Hue counterpart to the `WLED_INVALID_IP` guard already documented on the WLED page.
- **Room map editor notes extended for v1.5.4** — context-menu entries now carry accessible names, and object drags traverse the object list once per move instead of twice.

### Fixed

- **The landing page's "Shipped" roadmap column no longer mislabels itself on a submodule bump.** Its heading interpolates `LATEST_VERSION` from the pinned submodule while the bullets underneath are hand-written, so moving the pin to the app's v1.5.4 would have re-titled a list of v1.5.3 changes as v1.5.4 — the exact silently-aging footnote the section's own lede promises not to have. The bullets now describe v1.5.4: Bridge Pro pairing, the corrected link-button state, the readiness-check SSRF fix, the screen-reader gaps, and RUSTSEC-2026-0235.

## [1.1.37] — 2026-08-10

### Security

- **The `fast-uri` override no longer pins the toolchain to a vulnerable release.** GHSA-7p8r-x3mc-p8w7 (host confusion via a backslash authority introducer) affects `fast-uri` below 3.1.5, and the override floor set in v1.1.35 was still `^3.1.2` — which the lockfile satisfied at 3.1.4. The floor moves to `^3.1.5` and the lockfile resolves accordingly. The package is development-scoped only (`@astrojs/check` → `@astrojs/language-server` → `volar-service-yaml` → `yaml-language-server` → `ajv`), so it never reached the shipped bundle and the `--prod` audit gate stayed green throughout; `pnpm audit --audit-level=high` across the full tree, dev included, is now clean too.
- **Dependabot's security update for `fast-uri` can complete again.** Because the caret override capped resolution below 4.x, Dependabot's attempt to move to 4.1.2 failed with "the latest possible version that can be installed is 3.1.4" and the update job errored on every run. Raising the floor within the 3.x line resolves the advisory without taking the major, so the job stops failing.

## [1.1.36] — 2026-08-10

### Security

- **Two high-severity CVEs in the shipped dependency tree are closed.** `js-yaml` picked up GHSA-5p4m-2wfm-xmqj (quadratic CPU consumption resolving `!!omap`, unpatched below 4.3.1) and `nanoid` picked up GHSA-2v37-7h3g-55p8 (custom generators can loop indefinitely when `size` is zero, patched in 3.3.17). Neither is a direct dependency — `js-yaml` arrives through `@astrojs/mdx` → `@astrojs/internal-helpers`, `nanoid` through `@tailwindcss/vite` → `vite` → `postcss` — and the refreshed lockfile resolves both to patched releases (4.3.1 and 3.3.18). The `pnpm audit --prod --audit-level=high` gate had been failing on `main` and passes again.
- **Transitive override floors raised to match the new advisories.** The existing `js-yaml` override still declared `^4.3.0`, the floor set for the earlier GHSA-52cp-r559-cp3m advisory and now itself vulnerable, so it moves to `^4.3.1`; `nanoid` joins the `pnpm.overrides` block at `>=3.3.17`. Both floors already match what the lockfile resolves, so the change records the constraint without any resolution churn.

### Fixed

- **The site-wide `Last-Modified` freshness signal is current again.** The edge middleware's `LAST_MODIFIED` constant had been left at 26 Jun 2026 across the v1.1.34 and v1.1.35 releases, so HTML and markdown responses that Cloudflare doesn't already stamp were advertising two-month-old content to crawlers and AI answer engines — the exact staleness the constant exists to prevent. It now carries this release's date.

### Dependencies

- **Minor/patch group bump across four packages** — `astro` 7.1.5 → 7.2.0 (which also moves vite 8.1.5 → 8.2.1), `marked` 18.0.7 → 18.0.9, `dompurify` 3.4.12 → 3.4.13, `isomorphic-dompurify` 3.19.0 → 3.22.0. Manifest and lockfile only, no source change; the prettier-check, type-check, build, and Lighthouse-CI gates pass unchanged.

### CI

- **`pnpm/action-setup` pinned forward from v6.0.9 to v6.0.10** in both the CI and deploy workflows, commit-SHA pinned as before.

## [1.1.35] — 2026-07-29

### Security

- **Four high-severity CVEs in the shipped dependency tree are closed.** `js-yaml` (GHSA-52cp-r559-cp3m), `svgo` (GHSA-2p49-hgcm-8545), `sharp` (GHSA-f88m-g3jw-g9cj) and `postcss` (GHSA-r28c-9q8g-f849) all picked up advisories after v1.1.34. None is a direct dependency — they arrive transitively through `astro`, `@astrojs/mdx` and `@tailwindcss/vite` — so each is pinned to its patched range via `pnpm.overrides`, alongside the existing `fast-uri` / `esbuild` / `yaml` entries. The `pnpm audit --prod --audit-level=high` gate had been failing on `main` and passes again.

### Fixed

- **TV sizes in the hardware checklist use a real prime mark.** The measurements were authored with a straight `"`, an unpaired quote the Markdown typographer had to guess at. Astro 7's typographer reads it as an opening quote, so the sizes now carry `U+2033` (double prime) — the correct character for inches, and unambiguous under any typographer. The same upgrade also corrects the opening quote on the USB controllers page heading, which had been rendering as a closing quote.

### Dependencies

- **Astro 6.4.8 → 7.1.5 and `@astrojs/mdx` 6.0.3 → 7.0.5**, which also moves vite from 7 to 8. The two majors travel together — `@astrojs/mdx` 6.x peers against Astro 6. Verified against a baseline build of the previous `main`: the output tree is identical (272 files, 54 HTML pages, 34 byte-identical OG images) and scoped-style hashes still resolve. The only deltas are the generator meta tag, regenerated `data-astro-cid` hashes, and tighter whitespace / CSS-declaration minification from the newer pipeline.
- **TypeScript deliberately held at 6.0.3.** The 7.x native compiler does not ship the programmatic Language Service API that `astro check` is built on, and `@astrojs/check` declares a `^5 || ^6` peer range — so `astro check` fails outright on TypeScript 7. Tracked upstream in withastro/roadmap#1321.
- **Minor/patch group bump across 11 packages** — `satori` 0.26 → 0.29, `tailwindcss` and `@tailwindcss/vite` 4.3.2 → 4.3.3, the three `@fontsource` families 5.2.x → 5.3.0, `marked` 18.0.6 → 18.0.7, `isomorphic-dompurify` 3.18 → 3.19, `prettier` 3.9.5 → 3.9.6, `prettier-plugin-tailwindcss` 0.8.0 → 0.8.1, `@astrojs/check` 0.9.9 → 0.9.10. Manifest + lockfile only.

### CI

- **`actions/setup-node` pinned forward from v6 to v7** in both the CI and deploy workflows.

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

- **`fix(security)`**: `community.astro` now wraps `triage[i].a` in `DOMPurify.sanitize()` before the `<dd set:html>` injection. Closes a latent XSS surface that would have activated if the hardcoded `triage` array ever became dynamic.
- **`feat(a11y)`**: Pagefind `.search-result` links get a `:global(.search-result:focus-visible)` outline + `outline-offset` so keyboard users see a visible focus ring on dynamically-injected DOM. Astro's scoped CSS otherwise ignored the rule.
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
