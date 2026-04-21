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

// In production, drafts are excluded. In dev the sidebar shows everything
// so the docs tree is navigable while content is being written.
const shouldShow = (entry: { data: { draft?: boolean } }) =>
  import.meta.env.PROD ? !entry.data.draft : true;

export async function listDocs(): Promise<CollectionEntry<'docs'>[]> {
  const entries = await getCollection('docs', shouldShow);
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
  return `/docs/${entry.id.replace(/\.mdx$/, '')}`;
}

export async function listCompare(): Promise<CollectionEntry<'compare'>[]> {
  const entries = await getCollection('compare', shouldShow);
  return entries.sort((a, b) => a.data.competitor.localeCompare(b.data.competitor));
}

export function compareHref(entry: CollectionEntry<'compare'>): string {
  return `/compare/${entry.id.replace(/\.mdx$/, '')}`;
}
