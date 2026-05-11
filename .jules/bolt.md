## 2026-04-28 - Sequential I/O in Astro Server Routes

**Learning:** Sequential `await` calls in data-fetching or build-time loops (like iterating over MDX entries and sequentially resolving `mdxBody`) can significantly slow down SSG (Static Site Generation) processes and dynamic endpoints. Even reading local files or calling `getCollection` sequentially aggregates the I/O cost. **Action:** When working with Astro routes or loops that need to parse multiple Markdown/MDX files, map entries to their promises and use `Promise.all` to fetch/resolve them concurrently before processing the results synchronously.

## 2026-04-29 - Parallelize file I/O in OG Generator

**Learning:** Sequential file reading and content collection fetching (`await readFile()`, `await getCollection()`) in Astro page routes creates a performance bottleneck during site generation, especially for static assets like fonts that are read repeatedly on module load. **Action:** When loading multiple independent file resources or querying multiple Astro content collections, group them into a single `Promise.all()` call to minimize total module initialization overhead.

## 2026-05-09 - Caching DOM lookups in keyboard event listeners

**Learning:** Re-querying the DOM using `querySelectorAll` inside a high-frequency event listener like `keydown` (especially for common keys like `Tab` used in focus traps) causes unnecessary layout thrashing and performance overhead, particularly on lower-end devices navigating via keyboard. **Action:** When trapping focus or reacting to repeated key events that query static elements, cache the DOM NodeList on initialization or when the containing element opens, and reuse the cached reference inside the keydown listener.

## 2026-05-11 - Caching Promises vs Resolving Early in Debounced UI

**Learning:** When loading an asynchronous dependency (like the Pagefind search module) lazily inside a high-frequency debounced callback, caching the resolved module (`let pf = null`) instead of the loading Promise (`let pfPromise = null`) leads to a race condition. If multiple debounced triggers fire before the first load completes, `pf` remains null, causing redundant concurrent network requests or duplicate executions of initialization logic. Furthermore, iterating over all DOM elements (`forEach(el => el.toggleAttribute)`) to change a single active state within `keydown` events adds O(N) layout recalculations per keystroke. **Action:** When initializing async singletons triggered by user interaction, cache the Promise immediately synchronously so subsequent calls can `await` the same in-flight Promise. For linear keyboard navigation, always mutate only the specifically affected DOM nodes (O(1) updates) rather than relying on bulk `.forEach` recalcs.
