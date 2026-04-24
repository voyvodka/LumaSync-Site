// LLM-friendly full-content dump. Complements the short /llms.txt index
// by inlining every published docs, compare, and legal page body so
// answer engines (ChatGPT, Perplexity, Claude.ai) can ground responses
// without crawling each URL individually. Regenerates on every build
// from src/content/ — flipping a doc's draft:false auto-publishes it
// here too.
//
// On beta stage (PUBLIC_SITE_STAGE=beta) drafts are included so the
// owner can verify full content renders correctly before flipping
// drafts to public. Production builds always ship only published
// content.

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { LATEST_VERSION, LATEST_VERSION_DATE } from '../lib/version';
import { DOC_GROUPS, DOC_GROUP_LABELS } from '../lib/content';
import { mdxBody } from '../lib/mdx-body';

const SITE_URL = 'https://lumasync.app';
const INCLUDES_DRAFTS = import.meta.env.PUBLIC_SITE_STAGE === 'beta';

export const GET: APIRoute = async () => {
  const allDocs = await getCollection('docs');
  const allCompare = await getCollection('compare');
  const legal = await getCollection('legal');

  const docs = (INCLUDES_DRAFTS ? allDocs : allDocs.filter((e) => !e.data.draft)).sort((a, b) => {
    const ag = DOC_GROUPS.indexOf(a.data.group);
    const bg = DOC_GROUPS.indexOf(b.data.group);
    if (ag !== bg) return ag - bg;
    return a.data.order - b.data.order;
  });

  const compare = (INCLUDES_DRAFTS ? allCompare : allCompare.filter((e) => !e.data.draft)).sort(
    (a, b) => a.data.competitor.localeCompare(b.data.competitor),
  );

  const chunks: string[] = [];

  chunks.push('# LumaSync — Full Content');
  chunks.push('');
  chunks.push(
    '> Complete text of every published LumaSync documentation, comparison, and legal page, concatenated for AI retrieval. Short index at /llms.txt. Version of truth: built directly from the source MDX files on every site build.',
  );
  chunks.push('');
  chunks.push(`> Release: ${LATEST_VERSION} (${LATEST_VERSION_DATE})`);
  if (INCLUDES_DRAFTS) {
    chunks.push('>');
    chunks.push(
      '> **Staging build** — includes draft pages for owner review. Production omits drafts.',
    );
  }
  chunks.push('');

  for (const group of DOC_GROUPS) {
    const groupDocs = docs.filter((d) => d.data.group === group);
    if (!groupDocs.length) continue;
    chunks.push(`## ${DOC_GROUP_LABELS[group]}`);
    chunks.push('');
    for (const doc of groupDocs) {
      const slug = doc.id.replace(/\.mdx$/, '');
      chunks.push(`### ${doc.data.title}`);
      chunks.push('');
      chunks.push(`> ${doc.data.description}`);
      chunks.push('>');
      chunks.push(`> Source: ${SITE_URL}/docs/${slug}`);
      if (doc.data.draft) chunks.push('> Status: draft');
      chunks.push('');
      chunks.push(await mdxBody('docs', doc.id));
      chunks.push('');
      chunks.push('---');
      chunks.push('');
    }
  }

  if (compare.length) {
    chunks.push('## Comparisons');
    chunks.push('');
    for (const c of compare) {
      const slug = c.id.replace(/\.mdx$/, '');
      chunks.push(`### ${c.data.title}`);
      chunks.push('');
      chunks.push(`> ${c.data.description}`);
      chunks.push('>');
      chunks.push(`> Source: ${SITE_URL}/compare/${slug}`);
      if (c.data.draft) chunks.push('> Status: draft');
      chunks.push('');
      chunks.push(await mdxBody('compare', c.id));
      chunks.push('');
      chunks.push('---');
      chunks.push('');
    }
  }

  if (legal.length) {
    chunks.push('## Legal');
    chunks.push('');
    for (const l of legal) {
      const slug = l.id.replace(/\.mdx$/, '');
      chunks.push(`### ${l.data.title}`);
      chunks.push('');
      chunks.push(`> Source: ${SITE_URL}/${slug}`);
      chunks.push('');
      chunks.push(await mdxBody('legal', l.id));
      chunks.push('');
      chunks.push('---');
      chunks.push('');
    }
  }

  return new Response(chunks.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
