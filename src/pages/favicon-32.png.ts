import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

// 32×32 PNG fallback for search engines (Google in particular) that
// prefer raster favicons over scaling SVG themselves. Rendered from
// the same brand app-icon.svg as the 512×512 variant.

const svg = await readFile(resolve(process.cwd(), 'public/brand/app-icon.svg'), 'utf-8');

export const GET: APIRoute = () => {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 32 } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
