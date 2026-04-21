import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.enum(['getting-started', 'hue', 'usb-leds', 'ambilight', 'advanced', 'reference']),
    order: z.number().int(),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const compare = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/compare' }),
  schema: z.object({
    title: z.string(),
    competitor: z.string(),
    description: z.string(),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('voyvodka'),
    draft: z.boolean().default(false),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    effective: z.coerce.date(),
  }),
});

// The upstream CHANGELOG lives outside src/ (in vendor/lumasync/ via
// submodule). Astro's glob loader resists picking it up from outside
// the project's content root, so the changelog page reads the file
// directly with fs + marked — see src/pages/changelog.astro.

export const collections = { docs, compare, blog, legal };
