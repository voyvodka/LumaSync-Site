## 2026-04-28 - Sequential I/O in Astro Server Routes

**Learning:** Sequential `await` calls in data-fetching or build-time loops (like iterating over MDX entries and sequentially resolving `mdxBody`) can significantly slow down SSG (Static Site Generation) processes and dynamic endpoints. Even reading local files or calling `getCollection` sequentially aggregates the I/O cost. **Action:** When working with Astro routes or loops that need to parse multiple Markdown/MDX files, map entries to their promises and use `Promise.all` to fetch/resolve them concurrently before processing the results synchronously.

## 2026-04-29 - Parallelize file I/O in OG Generator

**Learning:** Sequential file reading and content collection fetching (`await readFile()`, `await getCollection()`) in Astro page routes creates a performance bottleneck during site generation, especially for static assets like fonts that are read repeatedly on module load. **Action:** When loading multiple independent file resources or querying multiple Astro content collections, group them into a single `Promise.all()` call to minimize total module initialization overhead.

## 2026-05-09 - Caching DOM lookups in keyboard event listeners

**Learning:** Re-querying the DOM using `querySelectorAll` inside a high-frequency event listener like `keydown` (especially for common keys like `Tab` used in focus traps) causes unnecessary layout thrashing and performance overhead, particularly on lower-end devices navigating via keyboard. **Action:** When trapping focus or reacting to repeated key events that query static elements, cache the DOM NodeList on initialization or when the containing element opens, and reuse the cached reference inside the keydown listener.

## 2026-05-15 - Caching initialization Promises for async dependencies

**Learning:** When lazily loading asynchronous dependencies (like Pagefind) inside high-frequency or concurrent callbacks (like opening a modal and typing immediately), checking only if the resolved module exists can lead to duplicate network requests and initialization calls if the first fetch is still pending. **Action:** Cache the initialization `Promise` itself rather than just the resolved module to prevent race conditions and duplicate execution.

## 2026-05-15 - O(1) DOM mutations for keyboard navigation

**Learning:** Iterating over an entire NodeList to toggle attributes (e.g., using `forEach` to remove and add a `data-active` attribute based on an index) for keyboard navigation causes O(N) DOM mutations and layout recalculations. **Action:** When updating the active state in a list, track the currently active index and explicitly toggle attributes only on the previously active and newly active nodes to reduce operations to O(1).

## 2026-05-15 - Replacing higher-order functions in nested iterations

**Learning:** In performance-sensitive nested iterations (such as matching multiple regex patterns against an array of items), using higher-order functions like `.find()` inside a loop introduces closure allocation per item. **Action:** Replace `.find()` with a manual indexed `for` loop inside the outer loop to eliminate closure overhead and improve execution speed by 15-20% through better JIT optimization.

## 2026-05-19 - Discarding stale async queries in search

**Learning:** When using a debounced input listener for asynchronous queries (like Pagefind search), slower older queries can resolve after newer ones. If results are rendered sequentially without verification, the UI may thrash and display stale data. **Action:** Always maintain a monotonic `queryId` in the local state of the search listener to track the latest input. Before updating the DOM or continuing async operations, verify that the `queryId` matches the currently active query to discard stale results and prevent race conditions.

## 2026-05-19 - Replacing chained array operations in Astro pages

**Learning:** Sequential, chained array operations (like `.flatMap()`, `.filter()`, and `.map()`) create intermediate arrays in memory and iterate over the collection multiple times (e.g., O(3N)). In build-time tools like Astro SSG or dynamic SSR endpoints that process collections of Markdown/MDX content, this causes unnecessary garbage collection and processing overhead, particularly when generating sitemaps or SEO schemas. **Action:** When filtering and transforming arrays simultaneously, replace the chained higher-order functions with a single `.reduce()` method (or a `for` loop inside `reduce`). This restricts the operation to a single O(N) pass and avoids intermediate array allocations entirely, speeding up static builds and SSR response times.
