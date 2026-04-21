import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { listDocs, DOC_GROUP_LABELS } from '../../lib/content';

// Dynamic OG generator per .thinking/02-website.md § #6.
//
// Template (1200×630, dark):
//   - surface gradient, amber 12 px inline-start rule, amber dot top-right
//   - left column: eyebrow category · page title (Plex Sans 600) ·
//     description (Plex Sans 400, muted)
//   - bottom-right: lumasync.app in mono, muted
//
// Switched from astro-og-canvas → raw satori + resvg-js so the template
// can place arbitrary text (URL footer, corner dot) and stay typography-
// synced with the site (.page-title = Plex Sans 600, not serif).

interface OgEntry {
  title: string;
  description: string;
  category: string;
}

// ─── Fonts ──────────────────────────────────────
// Loaded once at module scope and reused for every page's generation.
const fontRoot = resolve(process.cwd(), 'node_modules/@fontsource');
const plexSans400 = await readFile(
  `${fontRoot}/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff`,
);
const plexSans600 = await readFile(
  `${fontRoot}/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff`,
);
const plexMono400 = await readFile(
  `${fontRoot}/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff`,
);

const fonts = [
  { name: 'IBM Plex Sans', data: plexSans400, weight: 400 as const, style: 'normal' as const },
  { name: 'IBM Plex Sans', data: plexSans600, weight: 600 as const, style: 'normal' as const },
  { name: 'IBM Plex Mono', data: plexMono400, weight: 400 as const, style: 'normal' as const },
];

// ─── Entry set ─────────────────────────────────
const docs = (await listDocs()).map((e) => ({
  id: `docs/${e.id.replace(/\.mdx$/, '')}`,
  entry: {
    title: e.data.title,
    description: e.data.description,
    category: `Docs · ${DOC_GROUP_LABELS[e.data.group]}`,
  },
}));

const compareEntries = await getCollection('compare', (e) =>
  import.meta.env.PROD ? !e.data.draft : true,
);
const compare = compareEntries.map((e) => ({
  id: `compare/${e.id.replace(/\.mdx$/, '')}`,
  entry: {
    title: e.data.title,
    description: e.data.description,
    category: `LumaSync vs ${e.data.competitor}`,
  },
}));

const statics: Array<{ id: string; entry: OgEntry }> = [
  {
    id: 'landing',
    entry: {
      title: 'LumaSync',
      description:
        'Tray-first ambilight + Philips Hue Entertainment. Open source, no cloud, no HDMI box.',
      category: 'Open source · MIT',
    },
  },
  {
    id: 'changelog',
    entry: {
      title: 'Changelog',
      description: 'Release history, synced from the pinned app repo ref.',
      category: 'Release history',
    },
  },
  {
    id: 'download',
    entry: {
      title: 'Download LumaSync',
      description:
        'Install on macOS, Windows, or Linux. Signed binaries, checksums published.',
      category: 'Install',
    },
  },
  {
    id: 'community',
    entry: {
      title: 'Community',
      description: 'Where LumaSync users hang out — Discussions now, Discord later.',
      category: 'Get involved',
    },
  },
  {
    id: 'privacy',
    entry: {
      title: 'Privacy',
      description: 'How LumaSync handles your data. Short answer: it does not.',
      category: 'Legal',
    },
  },
  {
    id: 'license',
    entry: {
      title: 'License',
      description: 'LumaSync is released under the MIT License.',
      category: 'Legal',
    },
  },
];

const pages: Record<string, OgEntry> = Object.fromEntries(
  [...statics, ...docs, ...compare].map(({ id, entry }) => [id, entry]),
);

// ─── Template ─────────────────────────────────
function template(entry: OgEntry) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        position: 'relative',
        background: 'linear-gradient(135deg, #0a0b0e 0%, #1e2229 100%)',
        fontFamily: 'IBM Plex Sans',
        color: '#e7ecf2',
      },
      children: [
        // Amber left rule
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '12px',
              height: '630px',
              background: '#ffb020',
              display: 'flex',
            },
          },
        },
        // Amber dot, top-right
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '56px',
              right: '64px',
              width: '16px',
              height: '16px',
              borderRadius: '999px',
              background: '#ffb020',
              boxShadow: '0 0 0 10px rgba(255, 176, 32, 0.16)',
              display: 'flex',
            },
          },
        },
        // Content column
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '56px',
              left: '76px',
              right: '120px',
              bottom: '76px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
            children: [
              // Top: brand + eyebrow
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'IBM Plex Sans',
                          fontWeight: 600,
                          fontSize: '22px',
                          letterSpacing: '-0.01em',
                          color: '#e7ecf2',
                          display: 'flex',
                        },
                        children: 'LumaSync',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'IBM Plex Mono',
                          fontSize: '18px',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#ffb020',
                          display: 'flex',
                        },
                        children: entry.category,
                      },
                    },
                  ],
                },
              },
              // Middle: title + description
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '18px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'IBM Plex Sans',
                          fontWeight: 600,
                          fontSize: entry.title.length > 28 ? '64px' : '76px',
                          lineHeight: 1.08,
                          letterSpacing: '-0.02em',
                          color: '#e7ecf2',
                          display: 'flex',
                        },
                        children: entry.title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'IBM Plex Sans',
                          fontWeight: 400,
                          fontSize: '30px',
                          lineHeight: 1.4,
                          color: '#a8b0bc',
                          display: 'flex',
                          maxWidth: '900px',
                        },
                        children: entry.description,
                      },
                    },
                  ],
                },
              },
              // Bottom-right: URL
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'IBM Plex Mono',
                          fontSize: '22px',
                          color: '#6b7280',
                          letterSpacing: '0.02em',
                          display: 'flex',
                        },
                        children: 'lumasync.app',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  } as const;
}

// ─── Endpoint ──────────────────────────────────
export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(pages).map((id) => ({
    params: { route: `${id}.png` },
    props: { id },
  }));

export const GET: APIRoute = async ({ props }) => {
  const { id } = props as { id: string };
  const entry = pages[id];
  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const svg = await satori(template(entry) as never, {
    width: 1200,
    height: 630,
    fonts,
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
