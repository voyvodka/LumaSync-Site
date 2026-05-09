## 2026-04-28 - Sequential I/O in Astro Server Routes

**Learning:** Sequential `await` calls in data-fetching or build-time loops (like iterating over MDX entries and sequentially resolving `mdxBody`) can significantly slow down SSG (Static Site Generation) processes and dynamic endpoints. Even reading local files or calling `getCollection` sequentially aggregates the I/O cost. **Action:** When working with Astro routes or loops that need to parse multiple Markdown/MDX files, map entries to their promises and use `Promise.all` to fetch/resolve them concurrently before processing the results synchronously.

## 2026-04-29 - Parallelize file I/O in OG Generator

**Learning:** Sequential file reading and content collection fetching (`await readFile()`, `await getCollection()`) in Astro page routes creates a performance bottleneck during site generation, especially for static assets like fonts that are read repeatedly on module load. **Action:** When loading multiple independent file resources or querying multiple Astro content collections, group them into a single `Promise.all()` call to minimize total module initialization overhead.

## 2026-05-09 - Caching DOM lookups in keyboard event listeners

**Learning:** Re-querying the DOM using `querySelectorAll` inside a high-frequency event listener like `keydown` (especially for common keys like `Tab` used in focus traps) causes unnecessary layout thrashing and performance overhead, particularly on lower-end devices navigating via keyboard. **Action:** When trapping focus or reacting to repeated key events that query static elements, cache the DOM NodeList on initialization or when the containing element opens, and reuse the cached reference inside the keydown listener.
