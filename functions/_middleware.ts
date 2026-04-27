// Markdown for Agents — content-negotiation middleware.
//
// Mirrors Cloudflare's zone-level "Markdown for Agents" toggle, which
// isn't available on Free plans via the dashboard. For any request that
// carries `Accept: text/markdown` (preferring markdown at least as much
// as HTML), we serve the `.md` sibling of the requested page instead of
// the HTML one. Browsers with the default `Accept: text/html,...`
// continue to get HTML untouched.
//
// The per-page markdown bodies are generated at build time by
// src/pages/[...slug].md.ts, so this middleware just does the URL
// rewrite and forwards to the ASSETS binding.

// Minimal type stubs for the Cloudflare Pages runtime so astro check
// passes without pulling @cloudflare/workers-types into the Astro
// tsconfig scope. Only the members this middleware actually uses.
interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}) => Promise<Response>;

type Env = { ASSETS: Fetcher };

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const url = new URL(request.url);

  // Only negotiate on extensionless paths. Anything with a file
  // extension (including `.md`) gets passed through verbatim.
  if (/\.[a-z0-9]+$/i.test(url.pathname)) {
    return passThrough(await next());
  }

  if (prefersMarkdown(request.headers.get('Accept'))) {
    const mdUrl = new URL(url.toString());
    // Root path needs the explicit `/index.md` rewrite — stripping the
    // trailing slash leaves an empty string, so `+ '.md'` would resolve
    // to `.md` (no leading slash) and ASSETS would 404. Subpaths follow
    // the simple `/path/.md` convention.
    const stripped = url.pathname.replace(/\/$/, '');
    mdUrl.pathname = stripped === '' ? '/index.md' : `${stripped}.md`;
    const mdResponse = await env.ASSETS.fetch(new Request(mdUrl.toString(), request));
    if (mdResponse.ok) return passThrough(mdResponse);
    // No .md sibling exists for this path — fall through to HTML.
  }

  return passThrough(await next());
};

// Copy the response through but ensure `Vary: Accept` is set so
// downstream caches don't hand a markdown body to a browser (or vice
// versa). For markdown responses, also attach `X-Markdown-Tokens` —
// Cloudflare's static asset pipeline strips custom headers set at build
// time, so we recompute the estimate here on the edge and inject it
// into the outgoing response.
// Site-wide content-freshness signal. Bumped on each release deploy
// so AI answer engines and crawlers see a recent Last-Modified value
// — without one, GEO linters (isitagentready) flag the site as stale
// and downgrade citation priority. RFC 1123 / RFC 5322 format. Update
// whenever we cut a new submodule pin or land a substantive rev.
const LAST_MODIFIED = 'Mon, 27 Apr 2026 12:38:00 GMT';

async function passThrough(response: Response): Promise<Response> {
  const headers = new Headers(response.headers);
  const vary = headers.get('Vary');
  if (!vary) {
    headers.set('Vary', 'Accept');
  } else if (!/\baccept\b/i.test(vary)) {
    headers.set('Vary', `${vary}, Accept`);
  }

  const contentType = headers.get('Content-Type') ?? '';
  const isMarkdown = contentType.toLowerCase().includes('text/markdown');
  const isHtml = contentType.toLowerCase().includes('text/html');

  // Stamp a Last-Modified on HTML and markdown responses if Cloudflare
  // didn't already attach one. Static-asset responses for fingerprinted
  // bundles already carry their own mtime-based Last-Modified, so we
  // leave those alone.
  if ((isHtml || isMarkdown) && !headers.has('Last-Modified')) {
    headers.set('Last-Modified', LAST_MODIFIED);
  }

  if (isMarkdown && !headers.has('X-Markdown-Tokens')) {
    // Read the body so we can count. The .md payloads are ≤ ~20 KB each
    // so buffering them on the edge is a non-issue.
    const body = await response.text();
    // Rough heuristic: ~4 chars per token for English-dominant prose.
    headers.set('X-Markdown-Tokens', String(Math.ceil(body.length / 4)));
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Parse the Accept header and decide whether the client prefers
// markdown. Respects q-values; returns true only when `text/markdown`
// has the highest explicit q-value (or ties with the HTML family).
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  let markdownQ = 0;
  let htmlQ = 0;
  for (const raw of accept.split(',')) {
    const part = raw.trim();
    if (!part) continue;
    const [type, ...params] = part.split(';').map((s) => s.trim());
    const qParam = params.find((p) => p.toLowerCase().startsWith('q='));
    const q = qParam ? parseFloat(qParam.slice(2)) : 1.0;
    if (!Number.isFinite(q) || q <= 0) continue;
    if (type === 'text/markdown') {
      markdownQ = Math.max(markdownQ, q);
    } else if (
      type === 'text/html' ||
      type === 'application/xhtml+xml' ||
      type === 'text/*' ||
      type === '*/*'
    ) {
      htmlQ = Math.max(htmlQ, q);
    }
  }
  return markdownQ > 0 && markdownQ >= htmlQ;
}
