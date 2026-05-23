## 2026-04-28 - Respect User Preferences for Smooth Scrolling

**Learning:** When applying CSS behavior like `scroll-behavior: smooth;` globally on the `html` element for better UX navigation, it is critical to respect user accessibility preferences. **Action:** Wrap motion-based CSS properties in `@media (prefers-reduced-motion: no-preference)` to prevent causing discomfort or accessibility issues for users with vestibular or motion disorders.

## 2026-05-01 - Interactive Element Focus Rings

**Learning:** LumaSync's global `global.css` implements a sophisticated dual-layer `box-shadow` focus ring designed specifically to contrast against the amber backgrounds of CTA buttons (`.cta-primary`, `.tag-shipped`). **Action:** When adding `:focus-visible` styles to custom components to ensure keyboard accessibility (like `.search-cta` or `.close`), use `outline: 2px solid var(--focus-ring); outline-offset: 2px;` to match the project's design system without interfering with `box-shadow`.

## 2026-05-03 - Focus Rings for Dynamically Generated Client UI

**Learning:** When adding keyboard navigation and focus rings to elements dynamically injected into the DOM via client-side JavaScript (like Pagefind `.search-result` links), Astro's scoped CSS will ignore them unless the `:global()` modifier is applied. **Action:** Always wrap selectors for client-side injected elements in `:global()` (e.g., `:global(.search-result:focus-visible)`) to ensure the focus ring styling takes effect for keyboard users navigating the results.

## 2026-05-05 - Native Tooltips on Icon-Only Buttons

**Learning:** While `aria-label` is great for screen readers, visual users of icon-only buttons (like a magnifying glass for search or a hamburger menu) may still be confused about their exact function if there is no text. **Action:** When adding or auditing icon-only buttons, always ensure they have a native `title` attribute matching the `aria-label` to provide a native browser tooltip for visual users on hover.

## 2026-05-05 - Tactile Click Feedback on Interactive Elements

**Learning:** Adding a subtle scale-down effect on the `:active` state of interactive elements like buttons gives users immediate tactile feedback that their click was registered, improving the perceived responsiveness of the application. **Action:** Use `.element:active { transform: scale(0.96); }` (combined with an appropriate `transition`) on buttons to provide tactile feedback, but **always** wrap it in `@media (prefers-reduced-motion: no-preference)` to respect accessibility settings.

## 2026-05-15 - Tactile Click Feedback and Focus Rings on Interactive Cards

**Learning:** When using generic elements like `<a>` disguised as complex, interactive "cards" (e.g., download buttons with multiple text lines), the standard interactive states are often forgotten. Missing `:active` states deprive users of tactile feedback, and missing `:focus-visible` styles break keyboard navigation. **Action:** When auditing custom interactive components (like `.card`), ensure they include both a tactile `:active` state (e.g., `transform: scale(0.96);`) wrapped in `@media (prefers-reduced-motion: no-preference)` and an explicit `:focus-visible` outline using the project's standard `var(--focus-ring)`. Furthermore, ensure disabled states (e.g., `.card-disabled`) are explicitly excluded from these interaction animations.

## 2026-05-16 - Accessible Disabled Anchor Tags

**Learning:** Adding `pointer-events: none` and `aria-disabled="true"` to an `<a>` tag with a dummy `href="#"` is not sufficient to fully disable it for keyboard users. The link remains in the tab sequence and, if activated via the Enter key, can cause the page layout to jump to the top. **Action:** When a link designed to look like a button or card needs to be disabled, conditionally omit the `href` attribute entirely (e.g., `href={isDisabled ? undefined : actualHref}`). Without an `href`, browsers treat the `<a>` element as a non-interactive placeholder, naturally removing it from the focus order and disabling native activation behaviors.

## 2024-05-23 - Visual Keyboard Shortcuts Accessibility

**Learning:** Raw visual keyboard shortcuts inside buttons (like `<kbd>⌘</kbd><kbd>K</kbd>`) are read awkwardly by screen readers ("command K"), creating confusing noise during navigation. **Action:** Always wrap visual shortcut components in `aria-hidden="true"` and apply the standardized `aria-keyshortcuts` attribute (e.g. `aria-keyshortcuts="Meta+K Control+K"`) directly to the parent interactive element.
