// Live behaviour: the effect's clock runs, every tile and LED takes its colour at once, and the
// Hue lamps ease toward theirs the way the app smooths Hue under an effect (τ ≈ 200 ms).
import { EFFECTS, PALETTES, bytesFromLinear, loopsPerSec } from './model.mjs';
import { INITIAL, cellCentres, coloursAt, lampTargets, rgb } from './state.mjs';
import { readoutOf, valueTextOf } from './text.mjs';

const EFFECT_ORDER = ['wave', 'plasma', 'ocean', 'aurora', 'gradient'];
const PALETTE_ORDER = Object.keys(PALETTES);
const TOUR = [
  { effect: 'wave', palette: 'rainbow', seconds: 9 },
  { effect: 'wave', palette: 'sunset', seconds: 7 },
  { effect: 'plasma', palette: 'party', seconds: 8 },
  { effect: 'ocean', palette: 'ocean', seconds: 8 },
  { effect: 'aurora', palette: 'aurora', seconds: 9 },
  { effect: 'gradient', palette: 'sunset', seconds: 6 },
];
const HUE_TAU = 0.2;
const IDLE_MS = 3600;

export function mount(root) {
  const stage = root.querySelector('.iso-stage');
  const svg = stage.querySelector('svg');
  const cells = [...svg.querySelectorAll('.ef-cell')];
  const beads = [...svg.querySelectorAll('.ef-bead')];
  // Painted in depth order, so index them by the lamp they draw, not by their place in the page.
  const lamps = [];
  svg.querySelectorAll('[data-lamp]').forEach((node) => (lamps[Number(node.dataset.lamp)] = node));
  const readout = root.querySelector('[data-readout]');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const centres = cellCentres();

  const state = { ...INITIAL };
  let shown = { cells: [], strip: [], lamps: [] };
  let lampLinear = lampTargets(state);
  let touring = !still.matches;
  let tourAt = 0;
  let tourClock = 0;
  let scrub = null;
  let visible = false;
  let frame = 0;
  let last = 0;
  let idleTimer = 0;
  let focused = false;

  const paint = (nodes, colours, before, write) =>
    colours.forEach((colour, index) => {
      const text = rgb(colour);
      if (before[index] !== text) {
        before[index] = text;
        write(nodes[index], text);
      }
    });

  function describe() {
    readout.textContent = readoutOf(state);
    stage.setAttribute('aria-valuetext', valueTextOf(state));
  }

  function choose(effect, palette) {
    state.effect = effect;
    state.palette = palette;
    describe();
  }

  function draw(dt, calm) {
    const colours = coloursAt(state, centres);
    paint(cells, colours.cells, shown.cells, (node, text) => node.setAttribute('fill', text));
    paint(beads, colours.strip, shown.strip, (node, text) => node.style.setProperty('--led', text));
    const targets = lampTargets(state);
    const follow = calm ? 1 : 1 - Math.exp(-dt / HUE_TAU);
    lampLinear = lampLinear.map((rgbLinear, index) =>
      rgbLinear.map((c, channel) => c + (targets[index][channel] - c) * follow),
    );
    paint(lamps, lampLinear.map(bytesFromLinear), shown.lamps, (node, text) =>
      node.style.setProperty('--lamp', text),
    );
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const calm = still.matches;
    if (scrub !== null) state.loops += (scrub - state.loops) * (1 - Math.exp(-dt / 0.12));
    else if (!calm) state.loops += loopsPerSec(state.effect, state.speed) * dt;
    if (touring) {
      tourClock += dt;
      if (tourClock >= TOUR[tourAt].seconds) {
        tourClock = 0;
        tourAt = (tourAt + 1) % TOUR.length;
        choose(TOUR[tourAt].effect, TOUR[tourAt].palette);
      }
    }
    draw(dt, calm);
    frame = visible && !calm ? requestAnimationFrame(tick) : 0;
  }

  const run = () => {
    if (!frame && visible) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  const once = () => {
    if (still.matches) draw(0, true);
    else run();
  };
  const resume = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      scrub = null;
      if (focused || still.matches) return;
      touring = true;
      tourClock = 0;
      run();
    }, IDLE_MS);
  };
  const hold = () => {
    touring = false;
    resume();
  };
  const step = (list, current, by) =>
    list[(list.indexOf(current) + by + list.length) % list.length];

  new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) once();
    },
    { rootMargin: '120px 0px' },
  ).observe(stage);

  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const box = svg.getBoundingClientRect();
    const share = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    hold();
    scrub = Math.floor(state.loops) + share;
    if (still.matches) state.loops = scrub;
    once();
  });
  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    hold();
    const next = step(EFFECT_ORDER, state.effect, 1);
    choose(next, EFFECTS[next].palette);
    once();
  });
  stage.addEventListener('keydown', (event) => {
    const moves = {
      ArrowRight: () => {
        const next = step(EFFECT_ORDER, state.effect, 1);
        choose(next, EFFECTS[next].palette);
      },
      ArrowLeft: () => {
        const next = step(EFFECT_ORDER, state.effect, -1);
        choose(next, EFFECTS[next].palette);
      },
      ArrowUp: () => choose(state.effect, step(PALETTE_ORDER, state.palette, 1)),
      ArrowDown: () => choose(state.effect, step(PALETTE_ORDER, state.palette, -1)),
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    hold();
    moves[event.key]();
    once();
  });
  stage.addEventListener('focus', () => {
    focused = true;
    hold();
  });
  stage.addEventListener('blur', () => {
    focused = false;
    resume();
  });
  still.addEventListener('change', () => {
    touring = !still.matches && !focused;
    once();
  });
  describe();
}
