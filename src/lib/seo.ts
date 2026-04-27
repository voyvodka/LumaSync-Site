// Structured data helpers emitted as JSON-LD (schema.org).
//
// Every schema object is built with the canonical site URL as root so that
// Google, Bing, and AI crawlers can stitch the entity graph across pages.
// All builders return plain objects — the <Schema /> component serializes
// them as <script type="application/ld+json">.

export const SITE_URL = 'https://lumasync.app';
export const ORG_NAME = 'LumaSync';
export const ORG_LEGAL_NAME = 'LumaSync';
export const REPO_URL = 'https://github.com/voyvodka/LumaSync';

function abs(path: string): string {
  if (path.startsWith('http')) return path;
  return new URL(path, SITE_URL).toString();
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  legalName: string;
  alternateName: string[];
  description: string;
  slogan: string;
  keywords: string;
  url: string;
  logo: { '@type': 'ImageObject'; url: string; width: number; height: number };
  founder: { '@type': 'Person'; name: string; sameAs: string[] };
  sameAs: string[];
}

export function organizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    // Disambiguation against "Luma Sync" (with space), "Sync-on-Luma"
    // (RGB SCART retro-gaming term), and "Luma" (lumalabs.ai video AI).
    alternateName: ['LumaSync', 'Luma Sync'],
    description:
      'Open-source desktop ambient-lighting app that mirrors your screen to WS2812B LED strips over USB and Philips Hue Entertainment areas at the same time, from one source. Local-only, brand-agnostic, MIT-licensed.',
    slogan: 'Your screen, your lights. Locally.',
    keywords:
      'ambilight, ambient lighting, screen sync, Philips Hue, WS2812B, Adalight, desktop app, open source',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: abs('/brand/logotype-light.svg'),
      width: 512,
      height: 128,
    },
    founder: {
      '@type': 'Person',
      name: 'voyvodka',
      sameAs: ['https://github.com/voyvodka'],
    },
    sameAs: [REPO_URL, 'https://github.com/voyvodka', `${REPO_URL}/releases`],
  };
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  publisher: { '@id': string };
  potentialAction: {
    '@type': 'SearchAction';
    target: { '@type': 'EntryPoint'; urlTemplate: string };
    'query-input': string;
  };
}

export function webSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORG_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}

export interface SoftwareAppInput {
  name: string;
  description: string;
  version?: string;
  operatingSystems: string[];
  downloadUrl: string;
  datePublished?: string;
}

export function softwareAppSchema(input: SoftwareAppInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/download#software`,
    name: input.name,
    description: input.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: input.operatingSystems,
    softwareVersion: input.version,
    downloadUrl: abs(input.downloadUrl),
    datePublished: input.datePublished,
    publisher: { '@id': `${SITE_URL}/#organization` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export interface TechArticleInput {
  title: string;
  description: string;
  url: string;
  dateModified: string;
  section?: string;
}

export function techArticleSchema(input: TechArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    url: abs(input.url),
    dateModified: input.dateModified,
    articleSection: input.section,
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.url) },
    publisher: { '@id': `${SITE_URL}/#organization` },
    author: { '@id': `${SITE_URL}/#organization` },
  };
}

export interface ArticleInput {
  title: string;
  description: string;
  url: string;
  /** ISO 8601 (YYYY-MM-DD or full timestamp). */
  dateModified: string;
  /** First publish date — defaults to dateModified when omitted. */
  datePublished?: string;
  /** Absolute or root-relative hero image (1200×630 OG works). */
  image?: string;
}

/**
 * Generic Article — sibling to TechArticle, applied to landing-style
 * prose about the product itself. Article is more widely understood
 * by AI answer engines than TechArticle, so emitting both (one per
 * applicable page type) is the GEO triple-stack the isitagentready
 * linter looks for.
 */
export function articleSchema(input: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: abs(input.url),
    dateModified: input.dateModified,
    datePublished: input.datePublished ?? input.dateModified,
    ...(input.image && { image: abs(input.image) }),
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.url) },
    publisher: { '@id': `${SITE_URL}/#organization` },
    author: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  };
}

export interface ItemListItem {
  name: string;
  url: string;
  description?: string;
}

/**
 * Stand-alone ItemList — for pages that enumerate child resources
 * without being a full CollectionPage (e.g. the landing page's
 * features list). On true index pages use collectionPageSchema; it
 * wraps the same ItemList in a CollectionPage type that better
 * describes the page semantics.
 */
export function itemListSchema(input: { name: string; url: string; items: ItemListItem[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${abs(input.url)}#itemlist`,
    name: input.name,
    itemListElement: input.items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: abs(item.url),
      ...(item.description && { description: item.description }),
    })),
  };
}

export interface HowToStep {
  name: string;
  text: string;
  /** Optional anchor URL pointing at the on-page section. */
  url?: string;
}

export interface HowToInput {
  name: string;
  description: string;
  url: string;
  /** ISO 8601 duration, e.g. "PT5M" for five minutes. */
  totalTime?: string;
  steps: HowToStep[];
}

/**
 * HowTo — emitted on getting-started pages that walk the reader
 * through a sequence of steps (install, first-setup, hardware
 * checklist). Step.text must be self-contained for Google rich-result
 * eligibility; the docs page itself carries the full prose.
 */
export function howToSchema(input: HowToInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    ...(input.totalTime && { totalTime: input.totalTime }),
    step: input.steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: abs(step.url) }),
    })),
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.url) },
  };
}

export interface FAQItem {
  question: string;
  /** HTML-safe answer body. Accepts inline tags (<a>, <code>). */
  answer: string;
}

/**
 * Emit an FAQPage schema for pages that structure content as
 * question / answer pairs (e.g. /community triage, future /support).
 * Google treats this as rich-result eligible when each answer is
 * self-contained and doesn't require page context — keep answers
 * tight for best results.
 */
export function faqPageSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export interface CollectionItem {
  name: string;
  url: string;
  description?: string;
}

/**
 * Emit a CollectionPage + embedded ItemList for index pages that
 * enumerate child content (/docs, /compare). Signals to crawlers
 * and AI answer engines that the page is an entry point into a
 * hierarchy rather than an article; helps "related pages" surfaces
 * like Google's people-also-ask clusters.
 */
export function collectionPageSchema(input: {
  name: string;
  description: string;
  url: string;
  items: CollectionItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': abs(input.url),
    name: input.name,
    description: input.description,
    url: abs(input.url),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        url: abs(item.url),
        ...(item.description && { description: item.description }),
      })),
    },
  };
}
