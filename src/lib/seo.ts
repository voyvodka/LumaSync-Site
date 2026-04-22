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
  url: string;
  logo: { '@type': 'ImageObject'; url: string; width: number; height: number };
  sameAs: string[];
}

export function organizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: abs('/brand/logotype-light.svg'),
      width: 512,
      height: 128,
    },
    sameAs: [REPO_URL],
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
    operatingSystem: input.operatingSystems.join(', '),
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
