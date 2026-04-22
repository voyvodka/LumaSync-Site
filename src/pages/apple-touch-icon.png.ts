import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

// iOS home-screen icon. Rasterized at build time from the same source
// SVG used for the app tile, so it picks up any brand refresh for free.
// 180×180 is the Retina size Apple's guidelines recommend; older sizes
// are derived by the OS.

const svg = await readFile(resolve(process.cwd(), 'public/brand/app-icon.svg'), 'utf-8');

export const GET: APIRoute = () => {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 180 } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
