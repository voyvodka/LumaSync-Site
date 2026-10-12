// A living room in the app's room cube ([-1, 1] per axis: x left to right, y depth with +1 the
// TV wall, z floor to ceiling) and the same room in world units (x right, y toward the viewer,
// z up), shared by the build-time art and the live script.
import { boxCorners, fitProjection } from '../../iso/iso-kit.mjs';
import { boundsOf } from './model.mjs';

export const WIDTH = 600;
export const HEIGHT = 430;

// The room in metres, and the TV on its wall at the app's default mount height (40 %).
const ROOM = { width: 4.0, depth: 3.5, height: 2.6 };
const TV = { left: 1.45, width: 1.1, mount: 0.4 * 2.6 };

const toX = (m) => (m / ROOM.width) * 2 - 1;
const toZ = (m) => (m / ROOM.height) * 2 - 1;

export const SCREEN = {
  center: [toX(TV.left + TV.width / 2), 1, toZ(TV.mount)],
  halfWidth: TV.width / ROOM.width,
  halfHeight: TV.width / (16 / 9) / ROOM.height,
};

// LEDs per edge of the strip behind the TV, each placed along its edge as the app places it.
const EDGES = { top: 12, right: 7, bottom: 12, left: 7 };
function stripLeds() {
  const leds = [];
  const edge = (count, at) => {
    for (let i = 0; i < count; i++) leds.push(at((i + 0.5) / count));
  };
  edge(EDGES.top, (f) => [f, 0]);
  edge(EDGES.right, (f) => [1, f]);
  edge(EDGES.bottom, (f) => [1 - f, 1]);
  edge(EDGES.left, (f) => [0, 1 - f]);
  const { center, halfWidth, halfHeight } = SCREEN;
  return leds.map(([sx, sy]) => [
    center[0] + (sx * 2 - 1) * halfWidth,
    center[1],
    center[2] + (1 - sy * 2) * halfHeight,
  ]);
}

export const STRIP = stripLeds();

// Hue lights where a room map would put them: two Play bars beside the TV, a floor lamp and a
// table lamp. `u` is each one's place in the order around the screen, as the app ranks them.
export const LAMPS = [
  { name: 'Play bar, left', pos: [-0.4, 0.86, -0.515] },
  { name: 'Play bar, right', pos: [0.4, 0.86, -0.515] },
  { name: 'Floor lamp', pos: [-0.8, 0.15, 0.23] },
  { name: 'Table lamp', pos: [0.8, 0.35, -0.42] },
].map((lamp) => {
  const angle = Math.atan2(lamp.pos[2] - SCREEN.center[2], SCREEN.center[0] - lamp.pos[0]);
  return { ...lamp, angle: (((angle / (2 * Math.PI)) % 1) + 1) % 1 };
});
{
  const order = [...LAMPS].sort((a, b) => a.angle - b.angle);
  order.forEach((lamp, rank) => (lamp.u = rank / LAMPS.length));
}

export const BOUNDS = boundsOf([...STRIP, ...LAMPS.map((lamp) => lamp.pos)]);

// World units: 50 per metre, the floor at z 0, the TV wall's face at y = -WALL_Y.
export const WALL_Y = 87.5;
export const world = ([x, y, z]) => [x * 100, -y * WALL_Y, (z + 1) * 65];

export const FLOOR = { x: -100, y: -WALL_Y, w: 200, d: 98, r: 0 };
export const WALL_H = 96;
export const BASE = { x: -112, y: -104, w: 220, d: 124, r: 8 };
export const BASE_H = 8;
export const FOOT_H = 5;

// The field panel on the wall spans the lights' extents, exactly what the pattern is drawn over.
const [fx0, , fz0] = world([BOUNDS.min[0], 1, BOUNDS.min[2]]);
const [fx1, , fz1] = world([BOUNDS.max[0], 1, BOUNDS.max[2]]);
export const PANEL = { x0: fx0, x1: fx1, z0: fz0, z1: fz1, columns: 26, rows: 9 };

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [BASE.x, -WALL_Y - 4, WALL_H],
    [BASE.x + BASE.w, -WALL_Y - 4, WALL_H],
    [-104, BASE.y + BASE.d, WALL_H],
  ],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: 63, elevation: 26 },
);
