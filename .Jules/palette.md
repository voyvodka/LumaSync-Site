## 2026-04-28 - Respect User Preferences for Smooth Scrolling
**Learning:** When applying CSS behavior like `scroll-behavior: smooth;` globally on the `html` element for better UX navigation, it is critical to respect user accessibility preferences.
**Action:** Wrap motion-based CSS properties in `@media (prefers-reduced-motion: no-preference)` to prevent causing discomfort or accessibility issues for users with vestibular or motion disorders.
