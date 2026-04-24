// Per-page markdown endpoint. Every docs/compare/legal MDX page gets a
// parallel `.md` URL that returns the raw markdown body with a small
// frontmatter header, Content-Type: text/markdown, and an
// X-Markdown-Tokens estimate so agents can budget context.
//
// Paired with functions/_middleware.ts, which transparently rewrites
// `/page` → `/page.md` when the request carries `Accept: text/markdown`.
// Explicit `.md` URLs work standalone too (no Accept negotiation
// required), so crawlers that key off file extensions are covered.

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { mdxBody } from '../lib/mdx-body';

const INCLUDES_DRAFTS = import.meta.env.PUBLIC_SITE_STAGE === 'beta';

type Entry = CollectionEntry<'docs'> | CollectionEntry<'compare'> | CollectionEntry<'legal'>;

type Props = {
  collection: 'docs' | 'compare' | 'legal';
  entry: Entry;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allDocs = await getCollection('docs');
  const allCompare = await getCollection('compare');
  const legal = await getCollection('legal');

  const publishable = <T extends { data: { draft?: boolean } }>(e: T) =>
    INCLUDES_DRAFTS || !e.data.draft;

  const paths: Array<{ params: { slug: string }; props: Props }> = [];

  for (const entry of allDocs.filter(publishable)) {
    const slug = entry.id.replace(/\.mdx$/, '');
    paths.push({
      params: { slug: `docs/${slug}` },
      props: { collection: 'docs', entry },
    });
  }

  for (const entry of allCompare.filter(publishable)) {
    const slug = entry.id.replace(/\.mdx$/, '');
    paths.push({
      params: { slug: `compare/${slug}` },
      props: { collection: 'compare', entry },
    });
  }

  // Legal lives at top-level routes (/privacy, /license) on the site,
  // so the .md mirrors that: /privacy.md, /license.md — no prefix.
  for (const entry of legal) {
    const slug = entry.id.replace(/\.mdx$/, '');
    paths.push({
      params: { slug },
      props: { collection: 'legal', entry },
    });
  }

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { collection, entry } = props as Props;
  const { title, description } = entry.data as { title: string; description?: string };

  const body = await mdxBody(collection, entry.id);

  const header =
    `---\n` +
    `title: ${title}\n` +
    (description ? `description: ${description}\n` : '') +
    `---\n\n`;
  const content = header + body + '\n';

  // Rough token estimate: ~4 chars per token is the standard
  // heuristic for English-dominant technical prose.
  const tokens = Math.ceil(content.length / 4);

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Markdown-Tokens': String(tokens),
      'Cache-Control': 'public, max-age=3600',
      Vary: 'Accept',
    },
  });
};
