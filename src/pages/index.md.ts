// Homepage markdown endpoint. Mirrors `public/llms.txt` so agents
// hitting `/` with `Accept: text/markdown` get the same curated site
// guide that `llms.txt` exposes — without the agent having to know the
// llms.txt convention. Paired with functions/_middleware.ts which
// rewrites `/` → `/index.md` when the request prefers markdown.

import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const body = readFileSync(resolve('public/llms.txt'), 'utf-8');
const tokens = Math.ceil(body.length / 4);

export const GET: APIRoute = () =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Markdown-Tokens': String(tokens),
      'Cache-Control': 'public, max-age=3600',
      Vary: 'Accept',
    },
  });
