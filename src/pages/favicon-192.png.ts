import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

// 192×192 PNG for Android Chrome home-screen and search-result favicons
// that pull a higher-resolution variant. Rendered from the same brand
// app-icon.svg as the 32× and 512× endpoints.

const svg = await readFile(resolve(process.cwd(), 'public/brand/app-icon.svg'), 'utf-8');

export const GET: APIRoute = () => {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 192 } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
