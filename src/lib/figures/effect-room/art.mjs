// Build-time art for the Effect figure: a living-room model whose TV wall carries the effect's
// field. The strip and the lamps are coloured by the live script from the same model.
import * as k from '../../iso/iso-kit.mjs';
import {
  BASE,
  BASE_H,
  FLOOR,
  FOOT_H,
  HEIGHT,
  LAMPS,
  P,
  PANEL,
  SCREEN,
  STRIP,
  WALL_H,
  WALL_Y,
  WIDTH,
  world,
} from './layout.mjs';
import { cellCentres, coloursAt, rgb } from './state.mjs';
import { readoutOf } from './text.mjs';

// The colours the page shows before (or without) the live script.
let FIRST = null;

const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const at = (point) => k.iso(point, P);
const r1 = (v) => Math.round(v * 10) / 10;
const byDepth = (points) =>
  [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// Everything drawn flat on the TV wall's face uses this frame: local (x, -z) in world units.
const WALL = k.sideMatrix([0, -WALL_Y], 0, P, 'left');

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -BASE_H - FOOT_H, 1.6, P, 28), { tone: 'lo' }));
    out.push(
      S(k.cylinder(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: 'mid' }),
    );
  }
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 8, 1.6), { tone: 'mid' }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 4.5), 0, P), { tone: 'lo' }));
  const screws = k.corners(BASE, 8.5);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(''), { tone: 'lo' }));
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  const plate = { x: 66, y: FLOOR.y + FLOOR.d + 2, w: 30, d: 6.5, r: 1 };
  out.push(S(k.slabOf(plate, 0, 0.8, P, 3), { tone: 'lo' }));
  out.push(L(k.planOutline(k.insetPlan(plate, 1.2), 0.8, P, 3), { tone: 'faint' }));
  [0.7, 0.45].forEach((share, line) => {
    const y = plate.y + 2.4 + line * 1.8;
    out.push(
      L(k.lineOnTop([plate.x + 3, y], [plate.x + 3 + (plate.w - 9) * share, y], 0.8, P), {
        tone: 'lo',
        free: true,
      }),
    );
  });
  out.push(D([at([plate.x + plate.w - 2.6, plate.y + plate.d / 2, 0.8])], { size: 0.45 }));
  return out.join('');
}

function floor() {
  const out = [
    S(k.slabOf(FLOOR, 0, 0.8, P, 2), { tone: 'mid', flat: true, className: 'ef-floor' }),
  ];
  const planks = [];
  for (let y = FLOOR.y + 9; y < FLOOR.y + FLOOR.d - 1; y += 9)
    planks.push(k.lineOnTop([FLOOR.x, y], [FLOOR.x + FLOOR.w, y], 0.8, P));
  out.push(L(planks.join(''), { tone: 'faint' }));
  const rug = { x: -46, y: -58, w: 92, d: 46, r: 2 };
  out.push(S(k.slabOf(rug, 0.8, 0.5, P, 3), { tone: 'lo', className: 'ef-rug' }));
  out.push(L(k.planOutline(k.insetPlan(rug, 3.5), 1.3, P, 3), { tone: 'faint' }));
  return out.join('');
}

function walls() {
  const back = { x: -104, y: -WALL_Y - 4, w: 208, d: 4, r: 0 };
  const left = { x: -104, y: -WALL_Y, w: 4, d: FLOOR.d, r: 0 };
  const out = [S(k.slabOf(back, 0.8, WALL_H - 0.8, P, 1), { tone: 'mid', className: 'ef-wall' })];
  out.push(
    S(k.slabOf({ x: -100, y: -WALL_Y, w: 200, d: 1.4, r: 0 }, 0.8, 5, P, 1), {
      tone: 'mid',
      crease: 'lo',
    }),
  );
  out.push(S(k.slabOf(left, 0.8, WALL_H - 0.8, P, 1), { tone: 'mid', className: 'ef-wall' }));
  out.push(
    S(k.slabOf({ x: -100, y: -WALL_Y + 1.4, w: 1.4, d: FLOOR.d - 1.4, r: 0 }, 0.8, 5, P, 1), {
      tone: 'mid',
      crease: 'lo',
    }),
  );
  return out.join('');
}

// The field over the lights' extent, as tiles the live script colours, inside a thin frame.
function panel() {
  const { x0, x1, z0, z1, columns, rows } = PANEL;
  const w = (x1 - x0) / columns;
  const h = (z1 - z0) / rows;
  const cells = [];
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++)
      cells.push(
        `<rect class="ef-cell" x="${r1(x0 + column * w)}" y="${r1(-(z1 - row * h))}" width="${r1(w + 0.2)}" height="${r1(h + 0.2)}" fill="${rgb(FIRST.cells[row * columns + column])}"/>`,
      );
  const frame = `<rect class="ef-frame" x="${r1(x0 - 1.2)}" y="${r1(-z1 - 1.2)}" width="${r1(x1 - x0 + 2.4)}" height="${r1(z1 - z0 + 2.4)}"/>`;
  const marks = LAMPS.map(({ pos }) => {
    const [x, , z] = world(pos);
    return `<circle class="ef-mark" cx="${r1(x)}" cy="${r1(-z)}" r="2.2"/>`;
  }).join('');
  return `<g transform="${WALL}" data-part="panel"><g class="ef-cells">${cells.join('')}</g>${frame}${marks}</g>`;
}

// The strip's light on the wall, a little outside the TV so its body does not hide it.
function strip() {
  const [cx, , cz] = world(SCREEN.center);
  const halfZ = SCREEN.halfHeight * 65;
  const beads = STRIP.map((pos, index) => {
    const [x, , z] = world(pos);
    const onTopOrBottom = Math.abs(z - cz) > halfZ - 0.01;
    const bx = onTopOrBottom ? x : x + Math.sign(x - cx) * 3.4;
    const bz = onTopOrBottom ? z + Math.sign(z - cz) * 3.4 : z;
    return `<rect class="ef-bead" x="${r1(bx - 1.1)}" y="${r1(-bz - 1.1)}" width="2.2" height="2.2" rx="0.5" style="--led:${rgb(FIRST.strip[index])}"/>`;
  });
  return `<g transform="${WALL}" data-part="strip">${beads.join('')}</g>`;
}

function tv() {
  const [cx, , cz] = world([0, 1, -0.2]);
  const half = [27.5, 15.5];
  const body = { x: cx - half[0], y: -WALL_Y, w: half[0] * 2, d: 2.6, r: 0.8 };
  const out = [
    S(k.slabOf(body, cz - half[1], half[1] * 2, P, 2, 0.4), { tone: 'hi', crease: 'lo' }),
  ];
  const face = k.sideMatrix([0, -WALL_Y + 2.6], 0, P, 'left');
  const glass = {
    x: cx - half[0] + 1.6,
    y: -(cz + half[1] - 1.6),
    w: half[0] * 2 - 3.2,
    h: half[1] * 2 - 4,
  };
  out.push(
    `<g transform="${face}"><rect class="ef-screen" x="${r1(glass.x)}" y="${r1(glass.y)}" width="${r1(glass.w)}" height="${r1(glass.h)}" rx="0.6"/>` +
      `<path class="iso-line" data-tone="faint" d="M${r1(glass.x + glass.w * 0.62)} ${r1(glass.y)}L${r1(glass.x + glass.w * 0.4)} ${r1(glass.y + glass.h)}"/></g>`,
  );
  out.push(
    D([at([cx + half[0] - 3, -WALL_Y + 2.6, cz - half[1] + 1.1])], { size: 0.5, tone: 'hi' }),
  );
  return out.join('');
}

function sideboard() {
  const body = { x: -62, y: -WALL_Y + 1.5, w: 124, d: 22, r: 1 };
  const front = body.y + body.d;
  const out = [];
  for (const [x, y] of byDepth(k.corners(body, 4)))
    out.push(S(k.cylinder(x, y, 1.5, 0.8, 4.2, P, 14), { tone: 'mid' }));
  const seams = [-20.7, 20.7].map((x) => k.segment([x, front, 5], [x, front, 24], P)).join('');
  out.push(S(k.slabOf(body, 5, 19, P, 2, 0.4), { tone: 'mid', inner: L(seams, { tone: 'lo' }) }));
  out.push(S(k.slabOf(k.insetPlan(body, -1.2), 24, 2.2, P, 2, 0.5), { tone: 'mid' }));
  for (const x of [-41.4, 0, 41.4])
    out.push(
      S(k.slabOf({ x: x - 6, y: front, w: 12, d: 1.4, r: 0.6 }, 19.2, 1.6, P, 2), {
        tone: 'hi',
        crease: 'none',
      }),
    );
  const hub = { x: 10, y: -WALL_Y + 6, w: 10, d: 10, r: 2.6 };
  out.push(S(k.slabOf(hub, 26.2, 2.4, P, 4, 0.5), { tone: 'hi', crease: 'lo' }));
  out.push(L(k.ring(hub.x + 5, hub.y + 5, 2.4, 28.6, P, 24), { tone: 'lo' }));
  out.push(D([at([hub.x + 5, hub.y + 5, 28.6])], { size: 0.7, tone: 'hi' }));
  return out.join('');
}

// A Hue light: the part that glows takes `--lamp`, written by the live script.
const lampGroup = (index, body) =>
  `<g class="ef-lamp" data-lamp="${index}" style="--lamp:${rgb(FIRST.lamps[index])}">${body}</g>`;

function playBar(index) {
  const [x, y, z] = world(LAMPS[index].pos);
  const out = [
    S(k.slabOf({ x: x - 4, y: y - 3, w: 8, d: 6, r: 1 }, 26.2, 1.2, P, 2), { tone: 'mid' }),
  ];
  const bar = S(
    k.slabOf({ x: x - 2.6, y: y - 2.6, w: 5.2, d: 5.2, r: 0.9 }, 27.4, (z - 27.4) * 2, P, 3, 0.4),
    { tone: 'hi', crease: 'lo', className: 'ef-glow' },
  );
  out.push(lampGroup(index, bar));
  return out.join('');
}

function floorLamp(index) {
  const [x, y, z] = world(LAMPS[index].pos);
  const out = [S(k.cylinder(x, y, 7, 0.8, 1.6, P, 32, 0.4), { tone: 'mid' })];
  out.push(
    S(k.cylinder(x, y, 0.9, 2.4, z - 8.4, P, 12), {
      tone: 'mid',
      crease: 'none',
      inner: L(k.sideArc(x, y, 0.9, 40, P, 8), { tone: 'lo' }),
    }),
  );
  out.push(
    lampGroup(
      index,
      S(k.cylinder(x, y, 7.5, z - 6, 12, P, 40, 0.5), {
        tone: 'hi',
        crease: 'lo',
        className: 'ef-glow',
      }),
    ),
  );
  return out.join('');
}

function tableLamp(index) {
  const [x, y, z] = world(LAMPS[index].pos);
  const out = [S(k.cylinder(x, y, 7.5, 0.8, 1.4, P, 28), { tone: 'mid' })];
  out.push(S(k.cylinder(x, y, 1.5, 2.2, 23.6, P, 14), { tone: 'mid', crease: 'none' }));
  out.push(S(k.cylinder(x, y, 11.5, 25.8, 1.8, P, 44, 0.5), { tone: 'mid' }));
  out.push(S(k.cylinder(x, y, 3.4, 27.6, 1.8, P, 20), { tone: 'mid' }));
  out.push(S(k.cylinder(x, y, 0.6, 29.4, z - 3.7 - 29.4, P, 10), { tone: 'mid', crease: 'none' }));
  out.push(
    lampGroup(
      index,
      S(k.cylinder(x, y, 5.6, z - 3.7, 7.4, P, 32, 0.4), {
        tone: 'hi',
        crease: 'lo',
        className: 'ef-glow',
      }),
    ),
  );
  return out.join('');
}

// From each lamp straight back to the wall: where the field is read for it.
function lines(indices) {
  return indices
    .map((index) => {
      const [x, y, z] = world(LAMPS[index].pos);
      return k.wireSvg(at([x, y, z]), at([x, -WALL_Y, z]), {
        tone: 'lit',
        dotted: true,
        ends: 'to',
        size: 0.9,
      });
    })
    .join('');
}

export const LABEL =
  'A living-room model on a bench. A TV hangs on the back wall with an LED strip behind it, two Hue Play bars stand on the sideboard, and a Hue floor lamp and table lamp stand in the room. The wall behind the TV carries the running effect as a field across all of the lights, and a dotted line from each lamp to the wall marks the spot whose colour the lamp shows.';

export function figureHtml(initial) {
  FIRST = coloursAt(initial, cellCentres());
  const svg = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: LABEL,
    body: [
      base(),
      floor(),
      walls(),
      panel(),
      strip(),
      tv(),
      lines([0, 1]),
      sideboard(),
      playBar(0),
      playBar(1),
      lines([3]),
      tableLamp(3),
      lines([2]),
      floorLamp(2),
    ],
  });
  return k.plateHtml({
    fig: 'Effect',
    title: 'Coloured where it stands',
    hint: 'Hover to scrub · arrows change effect',
    readout: readoutOf(initial),
    keys: [
      { mark: 'flat', label: "The effect's field across every light" },
      { mark: 'dotted', label: "A lamp's place in the room, carried to the wall" },
    ],
    caption:
      "An effect is a field over your room, not a picture on a screen: every LED of the strip and every Hue light has a place in the room, the pattern is worked out at each place, and a palette gives it colour, so one wave crosses the TV and the lamps as one. These effects read a light's left-right place and its height, so each lamp shows the colour where its dotted line meets the wall. The Hue lights trail by about 200 ms, because the bridge doesn't blend between its updates.",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Effect field: arrow keys change the effect and the palette, pointer position moves the effect through time" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="${readoutOf(initial)}">${svg}</div>`,
  });
}
