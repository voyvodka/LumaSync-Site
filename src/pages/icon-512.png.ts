import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

// 512×512 PNG fallback for crawlers, schema.org Organization.logo
// cross-checks, and any consumer that can't render SVG logos.

const svg = await readFile(resolve(process.cwd(), 'public/brand/app-icon.svg'), 'utf-8');

export const GET: APIRoute = () => {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
