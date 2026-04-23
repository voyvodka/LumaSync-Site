# Contributing

Thanks for wanting to help. This repo is **only the LumaSync marketing
site and docs** (https://lumasync.app). For app-level changes — firmware,
USB pipeline, Hue streaming, UI — please contribute to the app repo:
https://github.com/voyvodka/LumaSync.

## Scope

- **Fixes welcome**: typos, broken links, stale version strings, a11y
  regressions, rendering glitches, incorrect docs.
- **Content welcome**: new comparisons, docs clarifications, translations,
  troubleshooting entries backed by real reports.
- **Out of scope here**: anything that requires changing the desktop app.

## Local setup

Requires Node 22+ and pnpm (pinned via `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

Before pushing, run all three gates locally — CI will fail if any does:

```bash
pnpm lint       # prettier --check
pnpm check      # astro check
pnpm build      # full production build + pagefind index
```

## Content conventions

- MDX files live under `src/content/<collection>/`. Each collection has a
  schema in `src/content/config.ts` — keep frontmatter consistent with
  existing entries.
- `description` ≤ 160 characters (SEO + OG card fit).
- Version strings in copy: use `{LATEST_VERSION}` / `{LATEST_VERSION_DATE}`
  imports from `src/lib/version`, never hard-code. They resolve at build
  time from the vendored LumaSync changelog.
- Drafts: set `draft: true` in frontmatter. Drafts are excluded from
  production builds (`PUBLIC_SITE_STAGE` unset) but included in beta
  (`PUBLIC_SITE_STAGE=beta`) so you can preview them on beta.lumasync.app.
- Don't claim features that aren't shipped. Cross-check
  [`vendor/lumasync/CHANGELOG.md`](vendor/lumasync/CHANGELOG.md).

## Commit messages

Conventional Commits, single focused paragraph per commit. Examples:

- `fix(docs): correct default baud rate in usb-leds/serial-protocol`
- `feat(compare): add wled 15.0 HDR-capture comparison row`
- `chore(deps): bump astro minor`

Split large changes into 2–3 focused commits rather than one mega-commit.

## Pull requests

- Target `main`.
- Reference related issues in the description.
- If your change alters a published page, paste the before/after URL pair
  from your local preview.
- Prettier, astro check, and the full build run in CI — all three must
  pass before review.

## License

- Code you contribute is licensed under the [MIT License](./LICENSE).
- Content (MDX copy, docs, comparisons) is licensed under CC BY 4.0.

By submitting a PR you confirm you have the right to contribute the
changes under these licenses.

## Security

Do **not** open public issues for security problems. Use GitHub's
Private Vulnerability Reporting: https://github.com/voyvodka/LumaSync-Site/security/advisories/new
