// Shared MDX → plain-text body extractor. Used by both the site-wide
// /llms-full.txt dump and the per-page .md content-negotiation endpoint
// so both sources stay byte-identical for a given page.
//
// Steps:
//   1. Strip YAML frontmatter.
//   2. Strip MDX `import ...` statements (they compile out in HTML but
//      would read as literal lines in a plain-text dump).
//   3. Substitute the build-time {LATEST_VERSION*} expressions that MDX
//      interpolates on render.
//   4. Collapse triple-blank-line runs introduced by the strips above.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LATEST_VERSION, LATEST_VERSION_BARE, LATEST_VERSION_DATE } from './version';

export async function mdxBody(collection: string, id: string): Promise<string> {
  // Astro 6 glob loader strips the .mdx extension from entry.id, so
  // reattach it when constructing the on-disk path.
  const filename = id.endsWith('.mdx') ? id : `${id}.mdx`;
  const filePath = resolve(process.cwd(), 'src/content', collection, filename);
  const raw = await readFile(filePath, 'utf-8');

  let body = raw.replace(/^---[\s\S]*?---\s*/m, '');
  body = body.replace(/^import\s+[^;]*?;?\s*$/gm, '');
  body = body.replace(/\{LATEST_VERSION_BARE\}/g, LATEST_VERSION_BARE);
  body = body.replace(/\{LATEST_VERSION_DATE\}/g, LATEST_VERSION_DATE);
  body = body.replace(/\{LATEST_VERSION\}/g, LATEST_VERSION);
  body = body.replace(/\n{3,}/g, '\n\n');

  return body.trim();
}
