// Stamp Pagefind's non-fingerprinted core JS with a build-unique comment so
// its bytes (and therefore its ETag) change on every deploy.
//
// Why this exists: Pagefind's `pagefind.js` / `pagefind-worker.js` / `pagefind-ui.js`
// are NOT content-hashed (only `/_astro/*` is). They inherit Cloudflare Pages'
// 4h default `Cache-Control`, so the edge caches the whole response — including
// the `Content-Security-Policy` header. Because the file bytes never change
// between deploys, conditional revalidation returns `304 Not Modified` and the
// edge keeps serving the STALE cached headers — even a "Purge Everything" gets
// re-revalidated back to the stale copy. That stranded the v1.1.28 CSP fix
// (`wasm-unsafe-eval`): the search worker kept compiling WASM under the old
// policy and search stayed broken. The WASM compile is governed by the WORKER
// script's own CSP, which is why `pagefind-worker.js` is the critical file.
//
// Changing the bytes here forces a new ETag, so the next revalidation is a full
// 200 (not a 304) and the current CSP ships. See memory project_pagefind_csp.
import { appendFileSync, existsSync } from 'node:fs';

const stamp = `\n/* build ${process.env.GITHUB_SHA ?? Date.now()} */\n`;
const files = ['pagefind-worker.js', 'pagefind.js', 'pagefind-ui.js'];

let stamped = 0;
for (const f of files) {
  const p = `dist/pagefind/${f}`;
  if (existsSync(p)) {
    appendFileSync(p, stamp);
    stamped++;
  }
}
console.log(`stamp-pagefind: stamped ${stamped}/${files.length} core file(s)`);
