# lumasync-site

Marketing site, documentation, and (later) blog for **LumaSync** — the
open-source tray-first Tauri 2 + React 19 desktop app at
[`voyvodka/lumasync`](https://github.com/voyvodka/lumasync).

This repository is intentionally separate from the app repository so that
site iteration, content drafts, and deploys do not touch the app's release
cadence or CHANGELOG.

## Target stack

- **Framework**: Astro (static, MDX-enabled), pnpm package manager.
- **Deploy**: Hetzner CX22 (EU) via rsync to Caddy-served static root.
- **Domain**: `lumasync.app` (primary). `www.lumasync.app` → 308 → apex.
- **Analytics**: Umami, self-hosted on the same box.

Not scaffolded yet. Scaffolding happens in a fresh session — see the
strategy docs below for the exact plan.

## Source of truth for strategy

Every major decision (site IA, landing brief, comparison pages, launch
plan, infra config) is pre-written at:

```
../.thinking/
```

Read `../.thinking/README.md` first. It indexes 7 numbered docs covering
positioning, website architecture, content/SEO strategy,
community/distribution, infrastructure, monetization, and the
30/60/90-day action plan.

**Before making changes here, align with the relevant `.thinking/` doc. If
reality diverges from the plan, update the plan doc — don't let them drift.**

## Scope

In-scope for this repo:

- Astro source: `src/`, `public/`, `astro.config.mjs`, etc.
- MDX content for `/docs/*`, `/compare/*`, `/blog/*` (later),
  `/changelog`, `/community`, `/privacy`.
- Site-specific assets (hero video, screenshots, OG images).
- GitHub Actions deploy workflow for Hetzner.

Out of scope:

- App source code (lives in `voyvodka/lumasync`).
- Server provisioning (Caddyfile, Umami compose) — tracked in a private
  dotfiles-style repo per `../.thinking/05-infrastructure.md`.

## Visibility

Starts **private**. Flipped to **public** before launch week (target:
Week 2 of `../.thinking/07-action-plan.md`). Rationale in the parent
session notes.

## License (when public)

MIT for code. Content (copy, docs, comparison pages, blog posts): CC BY 4.0
unless otherwise noted per-file.
