## 2026-04-28 - Respect User Preferences for Smooth Scrolling

**Learning:** When applying CSS behavior like `scroll-behavior: smooth;` globally on the `html` element for better UX navigation, it is critical to respect user accessibility preferences. **Action:** Wrap motion-based CSS properties in `@media (prefers-reduced-motion: no-preference)` to prevent causing discomfort or accessibility issues for users with vestibular or motion disorders.

## 2026-05-01 - Interactive Element Focus Rings

**Learning:** LumaSync's global `global.css` implements a sophisticated dual-layer `box-shadow` focus ring designed specifically to contrast against the amber backgrounds of CTA buttons (`.cta-primary`, `.tag-shipped`). **Action:** When adding `:focus-visible` styles to custom components to ensure keyboard accessibility (like `.search-cta` or `.close`), use `outline: 2px solid var(--focus-ring); outline-offset: 2px;` to match the project's design system without interfering with `box-shadow`.
