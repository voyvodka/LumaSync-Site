// Build-time art for the serial frame figure: a paper-tape reader whose tape carries one
// LumaSync v1 frame per 18 rows. Only the tape, the pins and the latches move.
import * as k from '../../iso/iso-kit.mjs';
import {
  BASE,
  BASE_H,
  CHIP,
  CHIP_X,
  DECK,
  DECK_TOP,
  FEED_PIN_R,
  FEED_R,
  FEED_Y,
  FOOT_H,
  FRAME,
  HEAD,
  HEAD_TOP,
  HEAD_X,
  HEAD_Z,
  HEIGHT,
  HOLE_R,
  LATCH,
  P,
  PIN_R,
  POST,
  READ_X,
  ROWS,
  SCREEN,
  SPAN,
  STICK,
  STICK_TOP,
  STICK_Z,
  TAPE,
  TRACK_Y,
  WIDTH,
  byteAt,
  feedRiseAt,
  latchPaths,
  latchesAt,
  pinPaths,
  riseAt,
  rowX,
} from './layout.mjs';
import { fieldOf, frameBytes, wireMs } from './model.mjs';
import { readoutAt, valueTextAt } from './text.mjs';

const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const at = (point) => k.iso(point, P);
const depth = ([x, y]) => k.depthOf([x, y, 0], P);
const byDepth = (points) => [...points].sort((a, b) => depth(a) - depth(b));
const round = (value) => Math.round(value * 10) / 10;
const LEDS = SCREEN.length;

// A solid whose paths the live script rewrites: every role is always present, in this order.
function liveSolid(paths, { tone = 'hi', crease = 'faint', lit = false, attrs = '' }) {
  return (
    `<g class="iso-solid"${lit ? ' data-lit=""' : ''}${attrs}>` +
    `<path class="iso-fill" d="${paths.fill}"/>` +
    paths.shades
      .map((d, shade) => `<path class="iso-shade" data-shade="${shade}" d="${d}"/>`)
      .join('') +
    `<path class="iso-top" d="${paths.top}"/>` +
    `<path class="iso-line iso-crease" data-tone="${crease}" d="${paths.crease}"/>` +
    `<path class="iso-line iso-edge" data-tone="${tone}" d="${paths.outline}"/>` +
    `</g>`
  );
}

function hull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const out = [];
    for (const point of list) {
      while (out.length > 1 && cross(out[out.length - 2], out[out.length - 1], point) <= 0)
        out.pop();
      out.push(point);
    }
    return out.slice(0, -1);
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -BASE_H - FOOT_H, 1.6, P, 28), { tone: 'lo' }));
    out.push(
      S(k.cylinder(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: 'mid' }),
    );
  }
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 8, 1.6), { tone: 'mid' }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: 'lo' }));
  const screws = k.corners(BASE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(''), { tone: 'lo' }));
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  return out.join('');
}

function labelPlate() {
  const plan = { x: -84, y: 39, w: 28, d: 11, r: 1.4 };
  const out = [S(k.slabOf(plan, 0, 0.8, P, 4), { tone: 'lo' })];
  out.push(L(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 4), { tone: 'faint' }));
  [0.72, 0.5, 0.62].forEach((share, line) => {
    const y = plan.y + 3.6 + line * 2;
    out.push(
      L(k.lineOnTop([plan.x + 3.6, y], [plan.x + 3.6 + (plan.w - 11) * share, y], 0.8, P), {
        tone: 'lo',
        free: true,
      }),
    );
  });
  out.push(
    D(
      [
        at([plan.x + plan.w - 3.2, plan.y + 3, 0.8]),
        at([plan.x + plan.w - 3.2, plan.y + plan.d - 3, 0.8]),
      ],
      { size: 0.45 },
    ),
  );
  return out.join('');
}

function post(y) {
  const pad = { x: HEAD_X - 5.5, y: y - 2, w: 11, d: POST + 4, r: 1.5 };
  const column = { x: HEAD_X - POST / 2, y, w: POST, d: POST, r: 1 };
  return [
    S(k.slabOf(pad, 0, 2, P, 3, 0.5), { tone: 'mid' }),
    D([at([pad.x + 2, pad.y + 2, 2]), at([pad.x + pad.w - 2, pad.y + pad.d - 2, 2])], {
      size: 0.45,
    }),
    S(k.slabOf(column, 2, HEAD_Z - 2, P, 3, 0.5), { tone: 'mid' }),
  ].join('');
}

function deck() {
  const out = [S(k.slabOf(DECK, 0, DECK_TOP, P, 4, 0.6), { tone: 'mid' })];
  const minor = [];
  const major = [];
  for (let row = 2; rowX(row) < SPAN[1] - 2; row++) {
    const x = rowX(row);
    const tick = k.segment(
      [x, DECK.y + DECK.d, DECK_TOP],
      [x, DECK.y + DECK.d, DECK_TOP - (row % 5 ? 1.5 : 2.7)],
      P,
    );
    (row % 5 ? minor : major).push(tick);
  }
  out.push(L(minor.join(''), { tone: 'lo' }), L(major.join(''), { tone: 'mid' }));
  return out.join('');
}

// The tape boxes at both ends: a lid on a hinge at the outer edge, with a finger pull.
function block(x, slot) {
  const plan = { x, y: DECK.y, w: SPAN[0] - DECK.x, d: DECK.d, r: 1.5 };
  const top = DECK_TOP + 10;
  const seam = L(k.sideSeam(plan, top - 3, P, 4), { tone: 'faint' });
  const out = [S(k.slabOf(plan, DECK_TOP, 10, P, 4, 0.6), { tone: 'mid', inner: seam })];
  const outer = slot ? x + 1 : x + plan.w - 4;
  for (const y of [-21, 13]) {
    const leaf = { x: outer, y, w: 3, d: 8, r: 0.6 };
    out.push(S(k.slabOf(leaf, top, 0.6, P, 2), { tone: 'mid', crease: 'none' }));
    out.push(
      D([at([outer + 1.5, y + 2, top + 0.6]), at([outer + 1.5, y + 6, top + 0.6])], { size: 0.4 }),
    );
  }
  const pull = { x: slot ? x + plan.w - 4.5 : x + 1.5, y: -6, w: 3, d: 12, r: 1.4 };
  out.push(`<path class="sf-void" d="${k.planOutline(pull, top, P, 4)}"/>`);
  out.push(L(k.planOutline(pull, top, P, 4), { tone: 'lo' }));
  if (slot) {
    const face = x + plan.w;
    const mouth = [
      [face, TAPE.y - 1.5, DECK_TOP],
      [face, TAPE.y + TAPE.d + 1.5, DECK_TOP],
      [face, TAPE.y + TAPE.d + 1.5, TAPE.top + 1],
      [face, TAPE.y - 1.5, TAPE.top + 1],
    ];
    out.push(`<path class="sf-void" d="${k.pathOf(mouth.map(at), true)}"/>`);
    out.push(L(k.pathOf(mouth.map(at), true), { tone: 'lo' }));
  }
  return out.join('');
}

function rail(y) {
  const plan = { x: SPAN[0], y, w: SPAN[1] - SPAN[0], d: 3, r: 0.8 };
  const index = L(k.lineOnTop([READ_X, y], [READ_X, y + 3], DECK_TOP + 1.6, P), { tone: 'hi' });
  return [
    S(k.slabOf(plan, DECK_TOP, 1.6, P, 3, 0.3), { tone: 'mid', inner: index }),
    D(
      [-62, -6, 50].map((x) => at([x, y + 1.5, DECK_TOP + 1.6])),
      { size: 0.4 },
    ),
  ].join('');
}

const KIND_TONE = {
  magic: 'hi',
  brightness: 'hi',
  count: 'hi',
  red: 'red',
  green: 'green',
  blue: 'blue',
  checksum: 'hi',
};

function tape() {
  const from = rowX(ROWS[0]) - 3;
  const to = rowX(ROWS[1]) + 3;
  const slab = k.slabOf(
    { x: from, y: TAPE.y, w: to - from, d: TAPE.d, r: 0.5 },
    TAPE.z,
    TAPE.top - TAPE.z,
    P,
    2,
  );
  const holes = [];
  for (let row = ROWS[0]; row <= ROWS[1]; row++) {
    const x = round(rowX(row));
    const index = ((row % FRAME.length) + FRAME.length) % FRAME.length;
    const tone = KIND_TONE[fieldOf(index, LEDS).kind];
    holes.push(`<circle class="sf-feed" cx="${x}" cy="${FEED_Y}" r="${FEED_R}"/>`);
    for (let bit = 0; bit < 8; bit++)
      if ((byteAt(row) >> bit) & 1)
        holes.push(
          `<circle class="sf-hole" data-tone="${tone}" cx="${x}" cy="${TRACK_Y[bit]}" r="${HOLE_R}"/>`,
        );
  }
  const box = [];
  for (const x of SPAN)
    for (const y of [TAPE.y - 2, TAPE.y + TAPE.d + 2])
      for (const z of [TAPE.z - 0.2, TAPE.top + 0.2]) box.push(at([x, y, z]));
  return (
    `<clipPath id="sf-tape-span"><path d="${k.pathOf(hull(box), true)}"/></clipPath>` +
    `<g clip-path="url(#sf-tape-span)"><g data-part="tape">` +
    S(slab, { tone: 'hi', className: 'sf-tape' }) +
    `<g transform="${k.topMatrix([0, 0], TAPE.top, P)}">${holes.join('')}</g>` +
    `</g></g>`
  );
}

function pins() {
  const list = [
    ...TRACK_Y.map((y, bit) => ({
      y,
      r: PIN_R,
      rise: riseAt(bit, 0),
      attrs: ` data-pin="${bit}"`,
    })),
    { y: FEED_Y, r: FEED_PIN_R, rise: feedRiseAt(0), attrs: ' data-pin="feed"' },
  ].sort((a, b) => a.y - b.y);
  return list
    .map(({ y, r, rise, attrs }) =>
      liveSolid(pinPaths(y, r, rise), {
        tone: 'hi',
        crease: 'lo',
        attrs: attrs + (rise < 0.02 ? ' data-down=""' : ''),
      }),
    )
    .join('');
}

function head() {
  const out = [S(k.slabOf(HEAD, HEAD_Z, HEAD_TOP - HEAD_Z, P, 4, 0.6), { tone: 'mid' })];
  const strip = {
    x: HEAD_X - 2.6,
    y: TRACK_Y[0] - 3.3,
    w: 5.2,
    d: TRACK_Y[7] - TRACK_Y[0] + 6.6,
    r: 0.8,
  };
  out.push(L(k.planOutline(strip, HEAD_TOP, P, 3), { tone: 'lo' }));
  for (const y of TRACK_Y) {
    const slot = {
      x: HEAD_X - LATCH / 2 - 0.5,
      y: y - LATCH / 2 - 0.5,
      w: LATCH + 1,
      d: LATCH + 1,
      r: 0.5,
    };
    out.push(`<path class="sf-void" d="${k.planOutline(slot, HEAD_TOP, P, 2)}"/>`);
    out.push(L(k.planOutline(slot, HEAD_TOP, P, 2), { tone: 'lo' }));
  }
  const ends = [HEAD.y + 3.5, HEAD.y + HEAD.d - 3.5];
  out.push(
    D(
      ends.flatMap((y) => [at([HEAD_X - 2, y, HEAD_TOP]), at([HEAD_X + 2, y, HEAD_TOP])]),
      { size: 0.45 },
    ),
  );
  return out.join('');
}

function latches() {
  const xor = latchesAt(0);
  return TRACK_Y.map((_, bit) => ({ bit, up: (xor >> bit) & 1 }))
    .map(({ bit, up }) =>
      liveSolid(latchPaths(bit, up), {
        tone: 'hi',
        crease: 'lo',
        lit: !!up,
        attrs: ` data-latch="${bit}"`,
      }),
    )
    .join('');
}

function knob() {
  const [x, y] = [HEAD_X, HEAD.y + HEAD.d - 10];
  return [
    S(k.cylinder(x, y, 3, HEAD_TOP, 3.2, P, 24), { tone: 'mid' }),
    L(k.knurl(x, y, 3, HEAD_TOP, HEAD_TOP + 3.2, 20, P), { tone: 'lo' }),
    L(k.lineOnTop([x, y], [x + 2.4, y - 1.2], HEAD_TOP + 3.2, P), { tone: 'hi' }),
    D([at([x, y, HEAD_TOP + 3.2])], { size: 0.5, tone: 'hi' }),
  ].join('');
}

const PLUG = { x: STICK.x + 2.5, y: STICK.y + 2, w: 6, d: STICK.d - 4, r: 0.6 };
const PLUG_TOP = STICK_TOP + 4.2;

function stick() {
  const out = [];
  for (const x of [STICK.x + 6, STICK.x + STICK.w - 6])
    out.push(S(k.cylinder(x, STICK.y + STICK.d / 2, 2.2, 0, STICK_Z, P, 18), { tone: 'mid' }));
  out.push(S(k.slabOf(STICK, STICK_Z, STICK_TOP - STICK_Z, P, 3, 0.3), { tone: 'mid' }));
  const mid = STICK.y + STICK.d / 2;
  const trace = [
    STICK.x + 8.5,
    ...CHIP_X.flatMap((x) => [x - CHIP / 2 + 0.4, x + CHIP / 2 - 0.4]),
  ].slice(0, -1);
  const segments = [];
  for (let index = 0; index < trace.length; index += 2)
    segments.push(k.lineOnTop([trace[index], mid], [trace[index + 1], mid], STICK_TOP, P));
  out.push(L(segments.join(''), { tone: 'lo' }));
  CHIP_X.forEach((x, led) => {
    const plan = { x: x - CHIP / 2, y: mid - CHIP / 2, w: CHIP, d: CHIP, r: 0.5 };
    const [r, g, b] = SCREEN[led];
    out.push(
      `<g class="sf-chip" data-chip="${led}">` +
        S(k.slabOf(plan, STICK_TOP, 1.4, P, 2, 0.3), { tone: 'mid', crease: 'lo' }) +
        `<g transform="${k.topMatrix([x, mid], STICK_TOP + 1.4, P)}"><circle class="sf-lens" cx="0" cy="0" r="1.9" style="fill:rgb(${r} ${g} ${b})"/></g>` +
        `</g>`,
    );
    out.push(
      S(k.slabOf({ x: x + 5, y: mid + 1.4, w: 1.8, d: 1.1, r: 0.2 }, STICK_TOP, 0.7, P, 1), {
        tone: 'lo',
        crease: 'none',
      }),
    );
  });
  out.push(S(k.slabOf(PLUG, STICK_TOP, PLUG_TOP - STICK_TOP, P, 2, 0.4), { tone: 'mid' }));
  out.push(
    D(
      [-1.6, 0, 1.6].map((dy) => at([PLUG.x + PLUG.w / 2, PLUG.y + PLUG.d / 2 + dy, PLUG_TOP])),
      { size: 0.55, tone: 'hi' },
    ),
  );
  return out.join('');
}

// The cable leaves the front post and plugs into the back of the connector, where it is hidden.
function cable() {
  const y = STICK.y + STICK.d / 2;
  const route = [
    [HEAD_X + POST / 2, HEAD.y + HEAD.d - 6, 9],
    [HEAD_X + 7, HEAD.y + HEAD.d - 5.5, 4],
    [HEAD_X + 13, y, 0.9],
    [STICK.x - 6, y, 0.9],
    [STICK.x - 3.5, y, 7.4],
    [PLUG.x + 1, y, 7.4],
  ];
  const d = k.pathOf(route.map(at));
  return `<g class="sf-cable"><path class="sf-cable-skin" d="${d}"/><path class="sf-cable-core" d="${d}"/></g>${D([at(route[0])], { size: 1.1, tone: 'mid' })}`;
}

export const LABEL =
  'A paper-tape reader on a bench. Each row of the tape is one byte of a LumaSync v1 serial frame for a four-LED strip: AA, 55, brightness, the LED count low byte first, three gamma-corrected colour bytes per LED and an XOR checksum. Pins rise through the holes under the reading head, each pin flips the latch above it, and the LED stick beside the reader shows the four colours the frame carries.';

export function figureHtml() {
  const svg = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: LABEL,
    body: [
      base(),
      labelPlate(),
      post(HEAD.y + 2.5),
      deck(),
      block(DECK.x, true),
      rail(TAPE.y - 4),
      tape(),
      rail(TAPE.y + TAPE.d + 1),
      pins(),
      block(SPAN[1], false),
      post(HEAD.y + HEAD.d - 2.5 - POST),
      head(),
      latches(),
      knob(),
      cable(),
      stick(),
    ],
  });
  const big = frameBytes(120);
  return k.plateHtml({
    fig: 'Fig 1',
    title: 'One frame on tape',
    hint: 'Hover, tap or use arrow keys',
    readout: readoutAt(0),
    keys: [
      { mark: 'lit', label: 'Latches: the XOR of every byte read so far' },
      { mark: 'raised', label: 'Pins: one rises through each hole, a 1 bit' },
    ],
    caption: `Each row of the tape is one byte: a hole for every 1 bit across eight tracks, beside a smaller feed hole. Holes are ringed white for the header and the checksum, and red, green or blue for each LED's colour bytes. A pin rises through every hole on the reading line and flips its latch on the head, so the latches hold the XOR of every byte read so far; the checksum row brings them all down, because a whole frame XORs to zero. This four-LED frame is ${FRAME.length} bytes; a 120-LED strip sends ${big} bytes a frame, ${wireMs(big).toFixed(1)} ms at 115200 baud.`,
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Serial frame on tape: arrow keys step the tape one byte" aria-valuemin="0" aria-valuemax="${FRAME.length - 1}" aria-valuenow="0" aria-valuetext="${valueTextAt(0)}">${svg}</div>`,
  });
}
