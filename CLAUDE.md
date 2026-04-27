# Project guidance — lumasync-site

## Repository status: PUBLIC

This repository is published to GitHub at `github.com/voyvodka/LumaSync-Site` and every commit, file, and tag is world-readable. Treat every artifact you write here as a public release.

## Private-information rules

Before staging or committing, scan the diff for anything that should not become public. The owner has flagged this as a recurring concern — do not skip the check.

### Never include in code, content, commit messages, tags, release notes, or CHANGELOG entries

- Raw analytics counts: GSC indexed/not-indexed numbers, Cloudflare AI Crawl Control bot hit counts, Web Analytics percentile values (LCP P50/P75/P90/P99), unique-visitor totals, request totals, cache hit ratios, traffic geography breakdowns. Describe the _direction_ of the problem qualitatively if needed ("indexing gap on sub-pages") but do not commit the numbers.
- Internal observability dashboard URLs, account IDs, project IDs, Cloudflare zone IDs, GSC verification tokens.
- Hue bridge IPs, mDNS hostnames, network topology of the owner's rig, CH340/FT232 serial port paths from the owner's machine, MAC addresses, USB VID:PID values not already documented as supported hardware.
- API keys, signed-update minisign secret keys, deploy tokens, IndexNow API keys, GitHub PATs, Wrangler API tokens, OAuth client secrets. The minisign _public_ key is fine; the secret never is.
- Anything from the owner's local notes (`.planning/`, `.thinking-local/`, `.claude/`, `*.local`). These are gitignored for a reason — do not paraphrase their content into a commit.
- Customer / community member personal information (emails, handles, Discord IDs) unless they posted publicly with their consent and the link is already in the discussion thread.

### Always safe to include

- Brand assets, public docs, marketing copy, hardware-checklist parts that are already public spec.
- LumaSync app's own changelog content (it surfaces from `vendor/lumasync/CHANGELOG.md` already public).
- Schema.org JSON-LD, robots.txt, sitemap, llms.txt content.
- Build configuration, Astro / Cloudflare Pages routing, public endpoints (URL paths, redirect aliases).
- The fact that a problem exists ("sitemap canonical mismatch was blocking sub-page indexing") and what was done to fix it.

## Pre-commit checklist

Run this before any `git add`:

1. `git diff` (working tree) and `git diff --staged` — read every line.
2. Search for raw numbers tied to internal dashboards: `grep -rE "GSC|[0-9]+ indexed|[0-9]+%|LCP P[0-9]+|Bing [0-9]+|ClaudeBot [0-9]+|Googlebot [0-9]+|PerplexityBot [0-9]+|ChatGPT-User [0-9]+|unique visitor|cache hit ratio|[0-9.]+k requests" .`
3. Search for IPs and obvious secrets: `grep -rE "192\.168|10\.0\.|api[_-]?key|secret|token=|sk_live|sk_test|aws_" .`
4. If anything matches, edit it out. Soft language ("indexing gap" not "30 of 34 URLs") preserves the intent without leaking.
5. Confirm `vendor/lumasync` is **not** in the diff. The submodule pin is owner-managed externally — never `git add vendor/lumasync`.

## Commit + push hygiene

- Conventional Commit prefixes: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `ci`, `build`, `perf`, `test`.
- English commit messages. Single concise paragraph per commit. If the change set spans multiple logical units, propose 2-3 split commits rather than one omnibus.
- **No AI attribution lines** in commit messages, tag annotations, GitHub release notes, or PR descriptions. The owner has flagged this as a hard rule.
- Never `git add -A` or `git add .`. Stage by name to avoid accidentally including ignored or sensitive files that crept into the working tree.
- Never `--no-verify`, `--no-gpg-sign`, or any hook bypass unless the owner asks for it.
- Force-push to `main` is forbidden without explicit owner approval.

## Versioning

Site follows independent semver from the LumaSync app. The app's version surfaces on `/changelog/` from the vendor submodule, but site-only refactors get their own `v1.x.y` line in this repo.

- Patch (`1.1.x`): bug fixes, copy tweaks, schema additions, content edits without structural change.
- Minor (`1.x.0`): new pages, new schemas, redirect alias batches, layout / IA changes.
- Major (`x.0.0`): brand redesign, framework migration, breaking URL changes that drop redirects.

Each release: tag annotated, push tag, create GitHub Release pulling notes from the matching `CHANGELOG.md` section. Compact bullet format for release notes (one bullet = one line) so GitHub renders cleanly.

## Build + deploy

- `pnpm format` before every commit (CI's prettier-check gate fails otherwise).
- `pnpm build` from a clean `unset PUBLIC_SITE_STAGE` env.
- Deploy: `npx wrangler pages deploy dist --project-name=lumasync-site --branch=main --commit-dirty=true`. Run from this directory — never let `npx wrangler` fall back to a parent-directory config.

## Local notes / planning

`.planning/`, `.thinking-local/`, `.claude/`, `*.local` are gitignored. Use these for audit reports, status notes, intermediate analysis. Never write public-shippable content into these paths (they won't deploy) and never paraphrase from them into commits or release notes.
