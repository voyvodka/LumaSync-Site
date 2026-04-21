# Capture manifest

Every visual on the site resolves to a file under `public/media/`. This file
is the contract between the site repo and whoever produces the real assets
(the owner, at capture time). **All dimensions, filenames, and UI states
listed here are final.**

Placeholder SVGs ship in this directory today. When a production
screenshot is ready, drop it in with the **same filename stem** and one of
the preferred formats (AVIF, WebP, or PNG in that order). The site's
`<img>` / `<picture>` references will use the new asset at the next
build — no HTML change needed if the stem matches, and no layout shift
because dimensions are locked.

## Format rules

- **AVIF + WebP + PNG** (in that order of preference). Avoid JPEG.
- **No GIF**, no hero video (per `.thinking/02-website.md § Phase 1`).
- **Hero images**: ≤ 400 KB per format.
- **Secondary images**: ≤ 250 KB per format.
- **Retina source**: capture at 2× the nominal pixel size; downscale the
  exported AVIF / WebP. For the 1600 × 1000 hero, capture at 3200 × 2000.

## Delivery path

Drop files into `public/media/<name>.<ext>`. The site automatically serves
everything under `public/` as static. Build re-runs pick up new files.

When real PNGs exist, the landing page can be upgraded to a `<picture>`
element with multi-format `<source>` entries:

```astro
<picture>
  <source srcset="/media/hero-lights-section.avif" type="image/avif" />
  <source srcset="/media/hero-lights-section.webp" type="image/webp" />
  <img src="/media/hero-lights-section.svg" width="1600" height="1000" alt="…" />
</picture>
```

The SVG remains as the ultimate fallback.

---

## Capture list (Phase 1 launch)

Ordered by priority. Placeholder SVGs for each slot are already committed.

### 1. `hero-lights-section` · **1600 × 1000** (16:10)

- **Priority**: P0 — landing hero.
- **UI state**: full-mode Lights Section, Ambilight mode active.
- **Include**: edge-signal preview visible, telemetry pill showing
  Δ / Σ numbers, the LED strip status indicator lit.
- **Exclude**: OS window chrome (capture the app region only).
- **Notes**: this becomes the **landing OG image** once cropped to
  1200 × 630 — consider capturing wide enough to allow that crop.
- **Placeholder**: `hero-lights-section.svg`

### 2. `ambient-mode-preview` · **1400 × 900** (14:9)

- **Priority**: P0 — "Ambient mode" landing callout.
- **UI state**: full-mode with Ambilight running, focused on the
  edge-signal preview + telemetry overlay.
- **Notes**: the landing overlays a live-styled telemetry pill on top
  of this image — keep busy UI chrome minimal in the bottom-left 30 %
  of the frame so the overlay reads cleanly.
- **Placeholder**: `ambient-mode-preview.svg`

### 3. `room-map-editor` · **1400 × 900** (14:9)

- **Priority**: P0 — "Room map editor" landing callout.
- **UI state**: editor open with a TV anchor, 2–3 furniture objects, a
  USB strip placed, and at least one Hue channel projected onto the
  canvas.
- **Include**: snap guides visible, origin crosshair, floating toolbar.
- **Placeholder**: `room-map-editor.svg`

### 4. `compact-mode` · **320 × 480** (2:3 ratio)

- **Priority**: P0 — "Tray-first UX" landing callout.
- **UI state**: compact CompactLayout window with a scene preset or mode
  selected, telemetry visible.
- **Notes**: match the exact window dimensions; this ships embedded at
  its native size in the dual-window composite on the landing.
- **Placeholder**: `compact-mode.svg`

### 5. `full-mode` · **900 × 620** (matches app window min size)

- **Priority**: P0 — "Tray-first UX" landing callout.
- **UI state**: full window with Lights Section open, sidebar visible.
- **Placeholder**: `full-mode.svg`

### 6. `hue-pairing` · **1200 × 800** (3:2)

- **Priority**: P1 — used in `/docs/hue/pairing`.
- **UI state**: the 4-step pairing tracker mid-flow, ideally at the
  "Pair" step showing the link-button prompt.
- **Placeholder**: `hue-pairing.svg`

### 7. `device-settings` · **1400 × 900** (14:9)

- **Priority**: P1 — used in `/docs/usb-leds/controllers`.
- **UI state**: Settings → Device with a serial port connected + a
  passing health check result.
- **Placeholder**: `device-settings.svg`

### 8. `update-modal` · **800 × 500** (8:5)

- **Priority**: P2 — optional, used in `/docs/advanced/auto-updater`.
- **UI state**: Update available modal, non-blocking preview.
- **Placeholder**: `update-modal.svg`

---

## Alt text conventions

When real screenshots land, update `alt=""` on the corresponding `<img>`
element in the Astro source with a **one-sentence functional
description**, not a literal transcription. Examples:

- **Good**: `alt="LumaSync's full window showing Ambilight mode driving
  a USB LED strip behind the TV, with live telemetry pills."`
- **Bad**: `alt="Screenshot of LumaSync"`.
- **Bad**: `alt="LumaSync showing 'Lights', 'Devices', 'Ambilight',
  'Telemetry: Δ 12 ms · Σ 60 fps', ..."` (just transcribes UI text).

Assistive tech benefits most from the *function* of the image in context.

---

## OG images

OG images are generated at build time by `src/pages/og/[...route].ts`
(Satori). They do not live in this directory. Override only if the
owner produces a hand-crafted `public/og/landing.png` — that file takes
precedence over the generated `/og/landing.png` per the hybrid rule in
`.thinking/02-website.md § #6`.

---

## When you update this manifest

- Adding a new capture slot: commit the placeholder SVG + the row here
  in the same commit.
- Removing a slot: delete the SVG *and* the row. Don't leave orphan
  references.
- Changing dimensions: update the SVG's `viewBox` + `width` / `height`
  attributes *and* the row. Off-ratio dimensions cause layout shift
  when the real image drops in.

Current ratio lock is deliberate — it's the single source of truth so a
screenshot dropped at 2× retina can scale back into the exact grid
position the site already reserved for it.
