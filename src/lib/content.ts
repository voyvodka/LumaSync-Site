import { getCollection, type CollectionEntry } from 'astro:content';

export const DOC_GROUPS = [
  'getting-started',
  'hue',
  'usb-leds',
  'ambilight',
  'advanced',
  'reference',
] as const;

export type DocGroup = (typeof DOC_GROUPS)[number];

export const DOC_GROUP_LABELS: Record<DocGroup, string> = {
  'getting-started': 'Getting Started',
  hue: 'Philips Hue',
  'usb-leds': 'USB LEDs',
  ambilight: 'Ambilight',
  advanced: 'Advanced',
  reference: 'Reference',
};

// Group-specific lede + keyword padding so each group hub ranks for the
// broad query (e.g. "lumasync hue setup", "lumasync usb leds").
//
// Exported rather than kept in the page because the OG generator needs the
// same text: a card whose description differs from the page it fronts is a
// second copy to keep in sync, and the six group cards were missing
// entirely until 2026-09-21 precisely because nothing tied them together.
export const GROUP_LEDE: Record<DocGroup, { lede: string; keywords: string }> = {
  'getting-started': {
    lede: 'Install LumaSync, run through first setup, and check your hardware against the supported list. Quick start path is below — start with Install, then First setup.',
    keywords: 'install, quick start, first setup, hardware checklist',
  },
  hue: {
    lede: 'Set up a Philips Hue bridge, configure an Entertainment Area, and troubleshoot streaming issues over DTLS 1.2 PSK.',
    keywords: 'Philips Hue, Hue bridge, Entertainment Area, DTLS, pairing, setup',
  },
  'usb-leds': {
    lede: 'Connect a CH340 or FT232 USB-serial controller, calibrate your WS2812B LED strip layout, and pick the right serial protocol — LumaSync v1 frame or Adalight profile.',
    keywords: 'WS2812B, USB-serial, CH340, FT232, LED calibration, Adalight, controller',
  },
  ambilight: {
    lede: 'Configure screen capture (handle macOS / Windows / Linux screen-recording permissions), tune ambilight performance (latency, FPS), and adjust colour per channel.',
    keywords:
      'ambilight, screen capture, screen recording, latency, FPS, performance, tuning, colour',
  },
  advanced: {
    lede: 'Auto-updater, multi-display rigs, and scenes — features that compose on top of the core ambilight loop.',
    keywords: 'auto-updater, multi-display, scenes, presets',
  },
  reference: {
    lede: 'Configuration files, error handling, notifications, keyboard shortcuts, and the (currently disabled) telemetry surface.',
    keywords: 'config file, error handling, notifications, shortcuts, telemetry',
  },
};

// Drafts are built into every environment so the owner can review on a
// deployed preview before flipping them public. Each draft entry:
//   - renders a "draft" pill in the sidebar + a banner on the page
//   - is marked `<meta name="robots" content="noindex,nofollow">`
//   - is excluded from the Pagefind search index (no data-pagefind-body
//     on draft pages — see docs/compare route files)
// Flip draft: false (or drop the flag) once copy passes review.

export async function listDocs(): Promise<CollectionEntry<'docs'>[]> {
  const entries = await getCollection('docs');
  return entries.sort((a, b) => {
    const ag = DOC_GROUPS.indexOf(a.data.group);
    const bg = DOC_GROUPS.indexOf(b.data.group);
    if (ag !== bg) return ag - bg;
    return a.data.order - b.data.order;
  });
}

export interface DocGroupBucket {
  group: DocGroup;
  label: string;
  items: CollectionEntry<'docs'>[];
}

export async function groupDocs(): Promise<DocGroupBucket[]> {
  const entries = await listDocs();
  return DOC_GROUPS.map((group) => ({
    group,
    label: DOC_GROUP_LABELS[group],
    items: entries.filter((e) => e.data.group === group),
  })).filter((g) => g.items.length > 0);
}

export function docHref(entry: CollectionEntry<'docs'>): string {
  return `/docs/${entry.id.replace(/\.mdx$/, '')}/`;
}

export async function listCompare(): Promise<CollectionEntry<'compare'>[]> {
  const entries = await getCollection('compare');
  return entries.sort((a, b) => a.data.competitor.localeCompare(b.data.competitor));
}

export function compareHref(entry: CollectionEntry<'compare'>): string {
  return `/compare/${entry.id.replace(/\.mdx$/, '')}/`;
}
