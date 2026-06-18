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

## 2026-05-18 - Keyboard Shortcuts in ARIA Labels

**Learning:** When displaying visual keyboard shortcuts (like `<kbd>⌘</kbd><kbd>K</kbd>`) inside interactive elements like buttons, screen readers may read the raw symbol characters clumsily, interrupting the label. **Action:** When adding keyboard shortcut hints, wrap the visual `<kbd>` elements in a container with `aria-hidden="true"` and apply the corresponding `aria-keyshortcuts` attribute to the parent interactive element (e.g., `aria-keyshortcuts="Meta+K"`) so the screen reader announces the standardized shortcut cleanly.

## 2026-05-19 - Explaining Disabled States

**Learning:** While making a link inaccessible to keyboard/click interactions (e.g., omitting `href` and adding `aria-disabled="true"`) is correct for structural accessibility, it leaves visual users who hover over the element confused as to _why_ it's disabled. **Action:** When visually disabling interactive elements (such as `<a>` tag cards functioning as buttons), always provide a native `title` attribute explaining why the element is disabled (e.g., 'No release available for this platform yet') to improve the UX for hovering users.

## 2026-05-20 - Disabled Element Interactivity

**Learning:** While using `cursor: default` instead of `pointer-events: none` preserves native browser tooltips on disabled elements, it can introduce a functional regression by restoring full mouse interactivity. **Action:** To prevent unintended navigation or JS event listener triggers on visually disabled links, ensure the `href` is conditionally removed or use `e.preventDefault()`, and ensure any `a:hover` styles explicitly exclude the disabled state (e.g., `a:hover:not(.disabled)`).

## 2026-06-18 - Transient Accessible Skip Links

**Learning:** Transient interactive elements (like 'Skip to content' links) that use CSS transforms to become visible must still include standard focus rings (`outline: 2px solid var(--focus-ring); outline-offset: 2px;`) and tactile `:active` scale states for consistent accessibility and UX. Without a tactile active state, the interaction can feel abrupt or dead. **Action:** Always ensure `.skip-link` and similar transient elements include a proper focus ring on `:focus-visible` and an `:active` state (e.g. `transform: translateY(0) scale(0.96);`) safely wrapped in `@media (prefers-reduced-motion: no-preference)`.
