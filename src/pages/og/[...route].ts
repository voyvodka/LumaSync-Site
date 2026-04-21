import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { listDocs, DOC_GROUP_LABELS } from '../../lib/content';

// Hybrid OG per .thinking/02-website.md § #6:
//   - landing (/)             → may be overridden by a hand-crafted
//                                public/og/landing.png if one exists
//   - everything else         → generated here at build time
//
// Template: dark surface gradient, amber left-side rule, page title in
// the display face, description in sans, eyebrow category label at top.
// Fonts loaded from Google Fonts at build time (IBM Plex Sans 500 for
// description + brand, Instrument Serif 400 for title).

interface OgEntry {
  title: string;
  description: string;
  category: string;
}

const siteTitle = (t: string) => (t === 'LumaSync' ? t : `${t}`);

const docs = (await listDocs()).map((e) => ({
  id: `docs/${e.id.replace(/\.mdx$/, '')}`,
  entry: {
    title: siteTitle(e.data.title),
    description: e.data.description,
    category: `Docs · ${DOC_GROUP_LABELS[e.data.group]}`,
  },
}));

const compareEntries = await getCollection(
  'compare',
  (e) => import.meta.env.PROD ? !e.data.draft : true,
);
const compare = compareEntries.map((e) => ({
  id: `compare/${e.id.replace(/\.mdx$/, '')}`,
  entry: {
    title: siteTitle(e.data.title),
    description: e.data.description,
    category: `LumaSync vs ${e.data.competitor}`,
  },
}));

const landing: { id: string; entry: OgEntry }[] = [
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
      description: 'Release history for LumaSync, synced from the pinned app repo ref.',
      category: 'Release history',
    },
  },
  {
    id: 'download',
    entry: {
      title: 'Download',
      description:
        'Install LumaSync on macOS, Windows, or Linux. Signed binaries, checksums published.',
      category: 'Install',
    },
  },
  {
    id: 'community',
    entry: {
      title: 'Community',
      description: 'Where LumaSync users hang out — GitHub Discussions now, Discord later.',
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
  [...landing, ...docs, ...compare].map(({ id, entry }) => [id, entry]),
);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path: string, entry: OgEntry) => ({
    title: entry.title,
    description: entry.description,
    logo: undefined,
    bgGradient: [
      [10, 11, 14],
      [30, 34, 41],
    ],
    border: {
      color: [255, 176, 32],
      width: 12,
      side: 'inline-start',
    },
    padding: 64,
    font: {
      title: {
        families: ['Instrument Serif', 'serif'],
        weight: 'Normal',
        size: 88,
        color: [231, 236, 242],
        lineHeight: 1.05,
      },
      description: {
        families: ['IBM Plex Sans', 'sans-serif'],
        weight: 'Normal',
        size: 32,
        color: [168, 176, 188],
        lineHeight: 1.4,
      },
    },
    // canvaskit-wasm reads TTF/OTF/WOFF — NOT woff2. Point at the WOFF
    // copies shipped by @fontsource/*. Google Fonts css2 URLs return CSS
    // with woff2-only src, which the loader cannot parse.
    fonts: [
      './node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff',
      './node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff',
      './node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff',
    ],
  }),
});
