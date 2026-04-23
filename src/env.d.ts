/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_UMAMI_SITE_ID?: string;
  readonly PUBLIC_UMAMI_SRC?: string;
  readonly PUBLIC_GITHUB_REPO?: string;
  // "beta" → emit global noindex,nofollow so staging deploys don't
  // leak into search or AI indexes. Unset / "production" → normal SEO.
  readonly PUBLIC_SITE_STAGE?: 'production' | 'beta';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
