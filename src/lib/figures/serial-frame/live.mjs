// Live behaviour: the tape steps one byte at a time, pins rise through the holes under the
// head, and each latch follows the running XOR of its track.
import { translateAlong } from '../../iso/iso-kit.mjs';
import {
  FEED_PIN_R,
  FEED_Y,
  FRAME,
  P,
  PIN_R,
  PITCH,
  SCREEN,
  TRACK_Y,
  feedRiseAt,
  indexAt,
  latchPaths,
  latchesAt,
  pinPaths,
  riseAt,
} from './layout.mjs';
import { fieldOf } from './model.mjs';
import { readoutAt, valueTextAt } from './text.mjs';

const STEP = 0.62;
const HOLD = 1.9;
const IDLE_MS = 3600;
const LENGTH = FRAME.length;

function paint(group, paths) {
  const [fill, s0, s1, s2, s3, top, crease, edge] = group.children;
  fill.setAttribute('d', paths.fill);
  [s0, s1, s2, s3].forEach((node, shade) => node.setAttribute('d', paths.shades[shade] || ''));
  top.setAttribute('d', paths.top);
  crease.setAttribute('d', paths.crease);
  edge.setAttribute('d', paths.outline);
}

// Critically damped spring, sub-stepped so a long frame cannot overshoot.
function spring(state, goal, dt, stiffness) {
  const damping = 2 * Math.sqrt(stiffness);
  for (let step = 0; step < 4; step++) {
    state.rate += ((goal - state.at) * stiffness - state.rate * damping) * (dt / 4);
    state.at += state.rate * (dt / 4);
  }
  if (Math.abs(goal - state.at) < 1e-3 && Math.abs(state.rate) < 1e-3) {
    state.at = goal;
    state.rate = 0;
    return false;
  }
  return true;
}

export function mount(root) {
  const stage = root.querySelector('.iso-stage');
  const svg = stage.querySelector('svg');
  const tape = svg.querySelector('[data-part="tape"]');
  const readout = root.querySelector('[data-readout]');
  const chips = [...svg.querySelectorAll('[data-chip]')];
  const pins = [...svg.querySelectorAll('[data-pin]')].map((group) =>
    group.dataset.pin === 'feed'
      ? { group, y: FEED_Y, radius: FEED_PIN_R, bit: -1 }
      : {
          group,
          y: TRACK_Y[Number(group.dataset.pin)],
          radius: PIN_R,
          bit: Number(group.dataset.pin),
        },
  );
  const start = latchesAt(0);
  const latches = [...svg.querySelectorAll('[data-latch]')].map((group) => {
    const bit = Number(group.dataset.latch);
    return { group, bit, at: (start >> bit) & 1, rate: 0 };
  });
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  const tapeState = { at: 0, rate: 0 };
  let target = 0;
  let touring = !still.matches;
  let visible = false;
  let frame = 0;
  let last = 0;
  let clock = 0;
  let nextAt = 1.4;
  let idleTimer = 0;
  let focused = false;
  let shown = 0;

  function draw() {
    const position = tapeState.at;
    tape.setAttribute(
      'transform',
      translateAlong(P, [-(((position % LENGTH) + LENGTH) % LENGTH) * PITCH, 0, 0]),
    );
    for (const pin of pins) {
      const rise = pin.bit < 0 ? feedRiseAt(position) : riseAt(pin.bit, position);
      pin.group.toggleAttribute('data-down', rise < 0.02);
      if (rise >= 0.02) paint(pin.group, pinPaths(pin.y, pin.radius, rise));
    }
    for (const latch of latches) paint(latch.group, latchPaths(latch.bit, latch.at));
    const index = indexAt(position);
    if (index === shown) return;
    shown = index;
    readout.textContent = readoutAt(index);
    stage.setAttribute('aria-valuenow', String(index));
    stage.setAttribute('aria-valuetext', valueTextAt(index));
    const field = fieldOf(index, SCREEN.length);
    chips.forEach((chip, led) => chip.toggleAttribute('data-on', field.led === led));
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const calm = still.matches;
    if (touring) {
      clock += dt;
      if (clock >= nextAt) {
        target += 1;
        nextAt = clock + STEP + (((target % LENGTH) + LENGTH) % LENGTH === LENGTH - 1 ? HOLD : 0);
      }
    }
    let moving = false;
    if (calm) {
      tapeState.at = target;
      tapeState.rate = 0;
    } else moving = spring(tapeState, target, dt, 230) || moving;
    const xor = latchesAt(tapeState.at);
    for (const latch of latches) {
      const goal = (xor >> latch.bit) & 1;
      latch.group.toggleAttribute('data-lit', goal === 1);
      if (calm) {
        latch.at = goal;
        latch.rate = 0;
      } else moving = spring(latch, goal, dt, 700) || moving;
    }
    draw();
    frame = visible && (touring || moving) ? requestAnimationFrame(tick) : 0;
  }

  const run = () => {
    if (!frame && visible) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  // The tour stays paused while the figure has focus, so a screen reader hears only the
  // values the reader asked for.
  const resume = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (focused || still.matches) return;
      touring = true;
      clock = 0;
      nextAt = STEP;
      run();
    }, IDLE_MS);
  };
  const steer = (next) => {
    touring = false;
    target = Math.max(0, next);
    resume();
    run();
  };
  const frameStart = () => Math.floor(target / LENGTH) * LENGTH;

  new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) run();
    },
    { rootMargin: '120px 0px' },
  ).observe(stage);

  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') steer(target + 1);
  });
  stage.addEventListener('focus', () => {
    focused = true;
    steer(target);
  });
  stage.addEventListener('blur', () => {
    focused = false;
    resume();
  });
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const box = svg.getBoundingClientRect();
    const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - 0.12) / 0.76));
    steer(frameStart() + Math.round(share * (LENGTH - 1)));
  });
  stage.addEventListener('keydown', (event) => {
    const moves = {
      ArrowRight: target + 1,
      ArrowUp: target + 1,
      ArrowLeft: target - 1,
      ArrowDown: target - 1,
      Home: frameStart(),
      End: frameStart() + LENGTH - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    steer(moves[event.key]);
  });
  still.addEventListener('change', () => {
    touring = !still.matches && !focused;
    run();
  });
}
