// World layout and camera, shared by the build-time art and the live script. Units are about
// a pixel; x runs along the tape, y across it, z up.
import { boxCorners, cylinder, fitProjection, slabOf } from '../../iso/iso-kit.mjs';
import { encodeFrame } from './model.mjs';

export const WIDTH = 600;
export const HEIGHT = 390;

// Four colours sampled along a screen edge: what the LEDs should look like.
export const SCREEN = [
  [255, 176, 32],
  [240, 96, 48],
  [160, 64, 160],
  [48, 96, 208],
];
export const BRIGHTNESS = 0.8;
export const FRAME = encodeFrame(BRIGHTNESS, SCREEN);

// Row and track pitch, as on real tape (0.1 in both ways).
export const PITCH = 5.2;
export const READ_X = -35;
export const TAPE = { y: -26, d: 52, z: 5, top: 5.4 };
export const SPAN = [-78, 78];
// Indexed by bit. Three tracks behind the feed track and five in front, as on 8-track tape.
export const TRACK_Y = [-20.8, -15.6, -10.4, 0, 5.2, 10.4, 15.6, 20.8];
export const FEED_Y = -5.2;
export const HOLE_R = 1.85;
export const FEED_R = 0.95;
export const PIN_R = 1.4;
export const FEED_PIN_R = 0.7;
export const PIN_RISE = 3.2;
// Rows drawn on the tape: enough for every offset within one frame to fill the span.
export const ROWS = [-9, 40];

export const BASE = { x: -100, y: -47, w: 200, d: 103, r: 8 };
export const BASE_H = 10;
export const FOOT_H = 5;
export const DECK = { x: -92, y: -32, w: 184, d: 64, r: 2 };
export const DECK_TOP = 5;

// The head stands just behind the reading line, so the pins stay in view in front of it.
export const HEAD_X = READ_X - 7.5;
export const HEAD = { x: HEAD_X - 4.5, y: -44, w: 9, d: 88, r: 1.4 };
export const HEAD_Z = 18;
export const HEAD_TOP = 24;
export const POST = 7;
export const LATCH = 3.4;
export const LATCH_LOW = 0.7;
export const LATCH_LIFT = 2.4;

export const STICK = { x: -18, y: 42, w: 92, d: 10, r: 1 };
export const STICK_Z = 4;
export const STICK_TOP = 5.2;
export const CHIP = 5.2;
export const CHIP_X = [6, 26, 46, 66];

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [HEAD.x, HEAD.y, HEAD_TOP + 6],
    [HEAD.x + HEAD.w, HEAD.y + HEAD.d, HEAD_TOP + 6],
  ],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 60, elevation: 40 },
);

export const rowX = (row) => READ_X + row * PITCH;

const wrap = (row) => ((row % FRAME.length) + FRAME.length) % FRAME.length;
export const byteAt = (row) => FRAME[wrap(row)];
export const indexAt = (position) => wrap(Math.round(position));

// A pin rises through a hole while the hole passes under it; `position` counts rows read.
const lift = (distance) => {
  const t = Math.max(0, 1 - Math.abs(distance) / 0.42);
  return t * t * (3 - 2 * t);
};
export function riseAt(bit, position) {
  const below = Math.floor(position);
  let rise = 0;
  for (const row of [below, below + 1])
    if ((byteAt(row) >> bit) & 1) rise = Math.max(rise, lift(position - row));
  return rise;
}
export const feedRiseAt = (position) =>
  Math.max(lift(position - Math.floor(position)), lift(position - Math.ceil(position)));

// The latches flip as a pin is half way up, so they hold the XOR of every row up to there.
export function latchesAt(position) {
  const last = wrap(Math.floor(position + 0.25));
  let xor = 0;
  for (let row = 0; row <= last; row++) xor ^= FRAME[row];
  return xor;
}

export const pinPaths = (y, radius, rise) =>
  cylinder(READ_X, y, radius, TAPE.top, Math.max(0.05, PIN_RISE * rise), P, 18);
export const latchPaths = (bit, up) =>
  slabOf(
    { x: HEAD_X - LATCH / 2, y: TRACK_Y[bit] - LATCH / 2, w: LATCH, d: LATCH, r: 0.4 },
    HEAD_TOP,
    LATCH_LOW + LATCH_LIFT * up,
    P,
    2,
    0.3,
  );
