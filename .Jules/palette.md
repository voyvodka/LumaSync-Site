## 2024-05-24 - Interactive Element Focus Rings
**Learning:** LumaSync’s global `global.css` implements a sophisticated dual-layer `box-shadow` focus ring designed specifically to contrast against the amber backgrounds of CTA buttons (`.cta-primary`, `.tag-shipped`).
**Action:** When adding `:focus-visible` styles to custom components to ensure keyboard accessibility (like `.search-cta` or `.close`), use `outline: 2px solid var(--focus-ring); outline-offset: 2px;` to match the project's design system without interfering with `box-shadow`.
