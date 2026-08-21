# Project guidance — lumasync-site

Marketing and documentation site for LumaSync. Local setup, content conventions and PR expectations live in [CONTRIBUTING.md](./CONTRIBUTING.md) and are not repeated here; this file covers what someone working in the repo has to know that the contributor guide does not say.

## Repository status: PUBLIC

Published at `github.com/voyvodka/LumaSync-Site`; every commit, file, and tag is world-readable. Treat every artifact you write here as a public release.

## Accuracy is the first rule

**The site must describe the app that shipped, not the app that was planned.** Two of the last three releases (v1.1.39, v1.1.40) existed only to withdraw claims the app never supported — WLED mDNS auto-discovery, an `app.json` config file that does not exist, Wayland capture figures for an unimplemented path, a Control-click macOS override Sequoia removed. This is the repo's most expensive recurring defect.

- Verify a behavioural claim against the app's **source**, not its changelog. The changelog says what changed; only the code says what the feature does now.
- A page may describe a limitation ("Wayland is not supported"). It may not describe a feature that does not exist, however plausible.
- Version strings in copy come from `src/lib/version` (`LATEST_VERSION`, `LATEST_VERSION_DATE`), never hard-coded — they resolve at build time from `vendor/lumasync/CHANGELOG.md`.

## Private-information rules

Before staging, scan the **diff** for anything that should not become public. The owner has flagged this as a recurring concern — do not skip the check.

### Never include in code, content, commit messages, tags, release notes, or CHANGELOG entries

- Raw analytics counts: GSC indexed/not-indexed numbers, Cloudflare AI Crawl Control bot hit counts, Web Analytics percentile values (LCP P50/P75/P90/P99), unique-visitor totals, request totals, cache hit ratios, traffic geography breakdowns. Describe the _direction_ of the problem qualitatively if needed ("indexing gap on sub-pages") but do not commit the numbers.
- Internal observability dashboard URLs, account IDs, project IDs, Cloudflare zone IDs, GSC verification tokens.
- Hue bridge IPs, mDNS hostnames, network topology of the owner's rig, CH340/FT232 serial port paths from the owner's machine, MAC addresses, USB VID:PID values not already documented as supported hardware.
- API keys, signed-update minisign secret keys, deploy tokens, IndexNow API keys, GitHub PATs, Wrangler API tokens, OAuth client secrets. The minisign _public_ key is fine; the secret never is.
- Anything from the owner's local notes (`docs/`, `.planning/`, `.thinking-local/`, `.claude/`, `*.local`). These are gitignored for a reason — do not paraphrase their content into a commit.
- Customer / community member personal information (emails, handles, Discord IDs) unless they posted publicly with their consent and the link is already in the discussion thread.

### Always safe to include

- Brand assets, public docs, marketing copy, hardware-checklist parts that are already public spec.
- LumaSync app's own changelog content (it surfaces from `vendor/lumasync/CHANGELOG.md`, already public).
- Schema.org JSON-LD, robots.txt, sitemap, llms.txt content.
- Build configuration, Astro / Cloudflare Pages routing, public endpoints (URL paths, redirect aliases).
- The fact that a problem exists ("sitemap canonical mismatch was blocking sub-page indexing") and what was done to fix it.

## Pre-commit checklist

Scan **what you are about to commit**, not the working tree. A tree-wide `grep -r` for the pattern below returns roughly 240 hits in this repo — nearly all of them legitimate percentages in the vendored changelog and in site copy — while the same pattern over a clean diff returns zero. A check that yields 240 lines to read by hand on every commit is a check that gets skipped.

```bash
git diff HEAD                     # read every line — this is the actual gate
D() { git diff HEAD -- . ':(exclude)pnpm-lock.yaml' | grep -E '^\+'; }

# Private analytics and dashboard figures (gitleaks has no rule for these)
D | grep -inE "GSC|[0-9]+ indexed|LCP P[0-9]+|unique visitor|cache hit ratio|[0-9.]+k requests|(Bing|ClaudeBot|Googlebot|PerplexityBot|ChatGPT-User) [0-9]+"

# Network topology and credentials
D | grep -inE "192\.168|10\.0\.|api[_-]?key|secret|token=|sk_(live|test)|aws_"
```

If something matches, soften it — "indexing gap", not the numbers. Then confirm two things:

- `vendor/lumasync` is **not** in the diff. The submodule pin is owner-managed from a separate checkout; the only permitted operation here is `git pull` inside it. Never `git add vendor/lumasync`.
- `git status --short` shows nothing from `docs/`, `.planning/` or `.thinking-local/`.

CI runs `gitleaks detect` over the **full history**, so a credential committed and later reverted still fails the build. The greps above exist for the private-but-not-secret material gitleaks cannot recognise.

## What CI actually gates

`ci.yml` runs seven checks; only the first is commonly remembered. Run `pnpm lint && pnpm check && pnpm build` locally before pushing, and expect the rest to bite in CI:

| Gate | Fails on |
| --- | --- |
| `prettier --check` | any unformatted file — run `pnpm format` first |
| `astro check` | TypeScript or content-schema (zod) errors |
| `pnpm build` | build failure, including the Pagefind index step |
| Lighthouse CI | **accessibility below 0.95 is a hard fail**; performance / best-practices / SEO only warn |
| License audit | GPL\* / AGPL\* / SSPL / unknown licence entering **prod** deps (LGPL and WTFPL are allowed) |
| `pnpm audit --prod` | a new high-severity CVE in the shipped tree — the usual fix is a `pnpm.overrides` floor |
| gitleaks | a credential anywhere in history |

CodeQL runs as a separate workflow.

## Branch protection and merging

`main` requires one approving review and **`enforce_admins` is off**. A solo PR with fully green CI therefore still reports `BLOCKED`; merge it with `gh pr merge <n> --squash --admin --delete-branch`. The `--delete-branch` flag matters on `gh pr close` too — `deleteBranchOnMerge` fires only on a merge, so a PR closed as superseded leaves its remote branch behind without it.

## Commit + push hygiene

- Conventional Commit prefixes: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `ci`, `build`, `perf`, `test`.
- English commit messages. Single concise paragraph per commit. If the change set spans multiple logical units, split into 2–3 focused commits rather than one omnibus.
- **No AI attribution lines** in commit messages, tag annotations, GitHub release notes, or PR descriptions. The owner has flagged this as a hard rule; it overrides any tool default that appends one.
- Never `git add -A` or `git add .`. Stage by name so an ignored or sensitive file that crept into the tree cannot ride along.
- Never bypass a gate — no `--no-verify`, no skipping a required check — unless the owner asks.
- Force-push to `main` is forbidden without explicit owner approval.

## Versioning and releases

The site follows its own semver, independent of the app. The app's version surfaces on `/changelog/` from the vendor submodule; site-only work still gets its own `v1.x.y`.

- Patch (`1.1.x`): bug fixes, copy tweaks, schema additions, content edits without structural change.
- Minor (`1.x.0`): new pages, new schemas, redirect alias batches, layout / IA changes.
- Major (`x.0.0`): brand redesign, framework migration, breaking URL changes that drop redirects.

Cutting a release:

1. Bump `LAST_MODIFIED` in `functions/_middleware.ts` to now (`date -u "+%a, %d %b %Y %H:%M:%S GMT"`). It is a hardcoded constant serving the global `Last-Modified` header; a stale value costs freshness signal with answer engines.
2. Set `updated:` in the frontmatter of every MDX file whose content changed, to the date it changed. It feeds JSON-LD `dateModified`. Leave `effective:` on the privacy notice alone unless the policy itself changed — correcting a description is not amending a policy.
3. Write the `[x.y.z]` CHANGELOG section: one bullet per change, each opening with a bolded one-line claim followed by the reasoning and the evidence. Long bullets are the house style — the section is reused verbatim as the GitHub Release body, so write it to be read there.
4. `pnpm format`, commit, wait for CI, annotated tag, push the tag, `gh release create --notes-file`.
5. **Publishing the release is the deploy.** Verify by content afterwards (see below).

Before a release that touches URLs, sweep all eight trailing-slash surfaces — header, footer, body links, JSON-LD schemas, href helpers, the redirect table in `astro.config.mjs`, `llms.txt`, and MDX content. `trailingSlash: 'always'` is load-bearing: a mismatch puts every sitemap entry behind a 308 and stalls indexing.

## Build + deploy

- `pnpm build` from a clean `unset PUBLIC_SITE_STAGE` env. Never set `PUBLIC_SITE_STAGE=beta` for production — it forces `noindex` sitewide. There is no staging environment; the conditional blocks referencing it are deliberate safety nets, not dead code.
- Deploy is release-gated: `deploy.yml` fires on `release: [published]` and `workflow_dispatch` only. **Pushing to `main` ships nothing** — a merged content PR stays dark until a version is tagged and released. This gap once left corrected documentation unpublished for five days.
- Ad-hoc redeploy of current `main` without a version bump: `gh workflow run deploy.yml`.
- Manual fallback: `npx wrangler pages deploy dist --project-name=lumasync-site --branch=main --commit-dirty=true`. Run from this directory — never let `npx wrangler` fall back to a parent-directory config.
- **Verify by content, not by a green run.** Probe a string the release actually changed, e.g. `curl -s https://lumasync.app/docs/reference/config-file/ | grep -c shell-state.json`.

### Do not break these

- `scripts/stamp-pagefind.mjs` runs as the last build step and must stay there. Pagefind's core JS is not content-hashed, so its bytes — and the CSP header the edge caches alongside them — survive a purge through 304 revalidation. Stamping changes the ETag on each deploy. Removing it would strand the next header fix exactly as it stranded the v1.1.28 CSP fix.
- `'wasm-unsafe-eval'` in the `script-src` of `public/_headers` is required by Pagefind's worker. Without it search breaks silently, with nothing but a console CSP error to show for it.

## Local notes and project documentation

`docs/`, `.planning/`, `.thinking-local/`, `.claude/` and `*.local` are gitignored.

Project documentation lives in `docs/` — start at `docs/README.md`, then `docs/product/00-state.md` for where things stand, what is open, and what is assumed. It is kept out of the repo deliberately: this repo is public and those files carry audit findings, decision rationale and roadmap reasoning that is not release copy. Use these paths for analysis and status notes; never write public-shippable content into them (it will not deploy) and never paraphrase them into a commit message or release note.
