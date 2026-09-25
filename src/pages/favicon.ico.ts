import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

// Browsers without SVG favicon support (Safari before 26) and every client
// that probes /favicon.ico by convention. Each size renders from its own
// pixel-hinted brand SVG, packed as PNG entries in one ICO container.

const sizes = [16, 32, 48];

const pngs = await Promise.all(
  sizes.map(async (size) => {
    const svg = await readFile(resolve(process.cwd(), `public/brand/favicon-${size}.svg`), 'utf-8');
    return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  }),
);

function packIco(images: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const headerSize = 6 + 16 * images.length;
  const out = new Uint8Array(
    new ArrayBuffer(headerSize + images.reduce((n, img) => n + img.length, 0)),
  );
  const view = new DataView(out.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((img, i) => {
    const entry = 6 + 16 * i;
    view.setUint8(entry, sizes[i]);
    view.setUint8(entry + 1, sizes[i]);
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, img.length, true);
    view.setUint32(entry + 12, offset, true);
    out.set(img, offset);
    offset += img.length;
  });
  return out;
}

export const GET: APIRoute = () =>
  new Response(packIco(pngs), {
    headers: { 'Content-Type': 'image/x-icon' },
  });
