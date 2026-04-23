# LumaSync-Site

Marketing site, docs, and blog for [**LumaSync**](https://github.com/voyvodka/LumaSync) —
the tray-first open-source ambilight + Philips Hue desktop app.

- **Production**: https://lumasync.app
- **Staging**: https://beta.lumasync.app (`PUBLIC_SITE_STAGE=beta`, global `noindex`)
- **App repo**: https://github.com/voyvodka/LumaSync

## Stack

- Astro 6 + MDX content collections (`docs`, `compare`, `legal`, `blog`)
- Pagefind for offline in-browser search; Umami for cookie-free analytics
- Cloudflare Pages (direct-upload via `wrangler`) + Cloudflare DNS
- IBM Plex Sans / Mono (self-hosted WOFF2, preloaded)
- No secrets bundled; the site never talks to the desktop app

## Develop

Requires Node 22+ and pnpm (pinned via `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm lint       # prettier --check
pnpm check      # astro check (type-check + content schema)
pnpm build      # astro build + pagefind index
```

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which lint-
and type-checks, builds with `PUBLIC_SITE_STAGE=beta`, and ships `dist/`
to the `lumasync-site-beta` Cloudflare Pages project. The production apex
(`lumasync.app` / `www.lumasync.app`) is served by a separate
coming-soon Worker until the content review wraps up.

Required repo secrets for CI: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## License

- **Code** (Astro components, layouts, CI, styling) — [MIT](./LICENSE)
- **Content** (MDX under `src/content/`, docs, comparisons, blog) — CC BY 4.0

See [`/license`](https://lumasync.app/license) for the public-facing summary
and [`LICENSE`](./LICENSE) for the full text.

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for
scope, local preview, and commit conventions. For app-level bugs
(firmware, USB pipeline, Hue streaming), file against the
[LumaSync app repo](https://github.com/voyvodka/LumaSync/issues) instead.

## Security

Report vulnerabilities through GitHub's Private Vulnerability Reporting —
see [`SECURITY.md`](./SECURITY.md) or [`/.well-known/security.txt`](https://lumasync.app/.well-known/security.txt).
