## 2026-04-28 - Respect User Preferences for Smooth Scrolling

**Learning:** When applying CSS behavior like `scroll-behavior: smooth;` globally on the `html` element for better UX navigation, it is critical to respect user accessibility preferences. **Action:** Wrap motion-based CSS properties in `@media (prefers-reduced-motion: no-preference)` to prevent causing discomfort or accessibility issues for users with vestibular or motion disorders.

## 2026-05-01 - Interactive Element Focus Rings

**Learning:** LumaSync's global `global.css` implements a sophisticated dual-layer `box-shadow` focus ring designed specifically to contrast against the amber backgrounds of CTA buttons (`.cta-primary`, `.tag-shipped`). **Action:** When adding `:focus-visible` styles to custom components to ensure keyboard accessibility (like `.search-cta` or `.close`), use `outline: 2px solid var(--focus-ring); outline-offset: 2px;` to match the project's design system without interfering with `box-shadow`.

## 2026-05-03 - Focus Rings for Dynamically Generated Client UI

**Learning:** When adding keyboard navigation and focus rings to elements dynamically injected into the DOM via client-side JavaScript (like Pagefind `.search-result` links), Astro's scoped CSS will ignore them unless the `:global()` modifier is applied.
**Action:** Always wrap selectors for client-side injected elements in `:global()` (e.g., `:global(.search-result:focus-visible)`) to ensure the focus ring styling takes effect for keyboard users navigating the results.
