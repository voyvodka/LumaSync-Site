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
    mdUrl.pathname = url.pathname.replace(/\/$/, '') + '.md';
    const mdResponse = await env.ASSETS.fetch(new Request(mdUrl.toString(), request));
    if (mdResponse.ok) return passThrough(mdResponse);
    // No .md sibling exists for this path — fall through to HTML.
  }

  return passThrough(await next());
};

// Copy the response through but ensure `Vary: Accept` is set so
// downstream caches don't hand a markdown body to a browser (or vice
// versa).
function passThrough(response: Response): Response {
  const headers = new Headers(response.headers);
  const vary = headers.get('Vary');
  if (!vary) {
    headers.set('Vary', 'Accept');
  } else if (!/\baccept\b/i.test(vary)) {
    headers.set('Vary', `${vary}, Accept`);
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
