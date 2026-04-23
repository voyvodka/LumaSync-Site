// Single source of truth for the "current LumaSync version" string that
// appears across landing + compare + docs pages. Read at build time from
// the pinned vendor/lumasync submodule's CHANGELOG so the site always
// quotes the same version the changelog page renders.
//
// Usage from MDX (content/**/*.mdx):
//   import { LATEST_VERSION, LATEST_VERSION_DATE } from '../../lib/version';
//   <!-- then interpolate: {LATEST_VERSION}, {LATEST_VERSION_DATE} -->
//
// Usage from Astro components (.astro files):
//   import { LATEST_VERSION } from '~/lib/version';
//
// Bumping the submodule is the only way to refresh these values —
// matches the changelog page's submodule-as-source contract.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const changelogPath = resolve(process.cwd(), 'vendor/lumasync/CHANGELOG.md');
const changelog = readFileSync(changelogPath, 'utf-8');

// First dated ## [X.Y.Z] — YYYY-MM-DD block wins. [Unreleased] has no
// date so the regex skips it naturally.
const match = changelog.match(/^## \[(\d+\.\d+\.\d+)\]\s*[—-]\s*(\d{4}-\d{2}-\d{2})/m);
if (!match) {
  throw new Error(
    'src/lib/version.ts: failed to parse latest dated release from ' +
      'vendor/lumasync/CHANGELOG.md. Did the submodule move to a ref ' +
      "that doesn't have a dated release entry yet?",
  );
}

export const LATEST_VERSION_BARE = match[1];
export const LATEST_VERSION = `v${match[1]}`;
export const LATEST_VERSION_DATE = match[2];
