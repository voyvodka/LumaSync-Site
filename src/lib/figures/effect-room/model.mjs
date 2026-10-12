// LumaSync's Effect mode as the app draws it (src-tauri/src/commands/lighting_mode/effects): every
// light has a place in the room cube, a pattern is evaluated there and a palette colours it.
// Only the effects whose pattern reads a light's left-right and floor-ceiling place are here.

const TAU = Math.PI * 2;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const fract = (v) => v - Math.floor(v);

// effectCatalogue.json: palette stops, and whether a palette wraps round.
export const PALETTES = {
  rainbow: {
    wrap: true,
    stops: ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
  },
  sunset: { wrap: false, stops: ['#2b1055', '#7b2869', '#d9455f', '#f7813b', '#ffc857'] },
  ocean: { wrap: false, stops: ['#001f3f', '#0057a8', '#0096c7', '#48cae4', '#b8f0ff'] },
  forest: { wrap: false, stops: ['#0b3d0b', '#1b5e20', '#2e7d32', '#7cb342', '#c0ca33'] },
  lava: { wrap: false, stops: ['#1a0000', '#8b0000', '#ff2a00', '#ff8c00', '#ffd000'] },
  aurora: { wrap: false, stops: ['#00c9a7', '#00e676', '#1de9b6', '#3d5afe', '#7c4dff'] },
  pastel: { wrap: true, stops: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e0bbff'] },
  warm: { wrap: false, stops: ['#ff7a1a', '#ff9a3c', '#ffb866', '#ffd199'] },
  ice: { wrap: false, stops: ['#0a2a66', '#1e6fd9', '#4fc3f7', '#b2ebf2', '#ffffff'] },
  party: { wrap: true, stops: ['#ff0080', '#7928ca', '#0070f3', '#00dfd8', '#ffb800'] },
  fire: { wrap: false, stops: ['#000000', '#5c0a00', '#c21f00', '#ff6a00', '#ffc233', '#fff2c2'] },
};

// Seconds per loop at speed 0 and at speed 1 (effects.rs, period_range).
export const EFFECTS = {
  wave: { palette: 'rainbow', period: [40, 3] },
  gradient: { palette: 'sunset', period: [120, 20] },
  ocean: { palette: 'ocean', period: [30, 4] },
  aurora: { palette: 'aurora', period: [40, 5] },
  plasma: { palette: 'party', period: [60, 5] },
};

export const DEFAULTS = { speed: 0.5, size: 0.5, intensity: 0.5 };

export function loopsPerSec(id, speed = DEFAULTS.speed) {
  const [slow, fast] = EFFECTS[id].period;
  return 1 / (slow * Math.pow(fast / slow, clamp01(speed)));
}

// --- palette (palette.rs): stops in OKLab, blended in OKLCh ---

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linearToSrgb = (c) => {
  const v = clamp01(c);
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
};
export const bytesFromLinear = (rgb) => rgb.map((c) => Math.round(linearToSrgb(c) * 255));

function linearToOklab([r, g, b]) {
  const l = Math.cbrt(0.41222146 * r + 0.53633255 * g + 0.051445995 * b);
  const m = Math.cbrt(0.2119035 * r + 0.6806995 * g + 0.10739696 * b);
  const s = Math.cbrt(0.08830246 * r + 0.28171885 * g + 0.6299787 * b);
  return [
    0.21045426 * l + 0.7936178 * m - 0.004072047 * s,
    1.9779985 * l - 2.4285922 * m + 0.4505937 * s,
    0.025904037 * l + 0.78277177 * m - 0.80867577 * s,
  ];
}

function oklabToLinear([l, a, b]) {
  const l_ = l + 0.39633778 * a + 0.21580376 * b;
  const m_ = l - 0.105561346 * a - 0.06385417 * b;
  const s_ = l - 0.08948418 * a - 1.2914855 * b;
  const [L, M, S] = [l_ ** 3, m_ ** 3, s_ ** 3];
  return [
    4.0767417 * L - 3.3077116 * M + 0.23096994 * S,
    -1.268438 * L + 2.6097574 * M - 0.34131938 * S,
    -0.0041960863 * L - 0.7034186 * M + 1.7076147 * S,
  ].map(clamp01);
}

const ACHROMATIC = 0.02;

function blendLch(a, b, t) {
  const ca = Math.hypot(a[1], a[2]);
  const cb = Math.hypot(b[1], b[2]);
  let ha = Math.atan2(a[2], a[1]);
  let hb = Math.atan2(b[2], b[1]);
  if (ca < ACHROMATIC && cb >= ACHROMATIC) ha = hb;
  else if (cb < ACHROMATIC && ca >= ACHROMATIC) hb = ha;
  let dh = hb - ha;
  if (dh > Math.PI) dh -= TAU;
  else if (dh < -Math.PI) dh += TAU;
  const l = a[0] + (b[0] - a[0]) * t;
  const c = ca + (cb - ca) * t;
  const h = ha + dh * t;
  return [l, c * Math.cos(h), c * Math.sin(h)];
}

const bytesOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

export function paletteOf(name) {
  const { wrap, stops } = PALETTES[name];
  const lab = stops.map((hex) => linearToOklab(bytesOf(hex).map((c) => srgbToLinear(c / 255))));
  const at = (value) => {
    const n = lab.length;
    const v = Number.isFinite(value) ? value : 0;
    let i;
    let j;
    let t;
    if (wrap) {
      const pos = (((v % 1) + 1) % 1) * n;
      i = Math.min(Math.floor(pos), n - 1);
      j = (i + 1) % n;
      t = pos - i;
    } else {
      const pos = clamp01(v) * (n - 1);
      i = Math.min(Math.floor(pos), n - 2);
      j = i + 1;
      t = pos - i;
    }
    return oklabToLinear(blendLch(lab[i], lab[j], t));
  };
  // A moving position loops on a wrapping palette and plays there and back on any other.
  const cyclic = (v) => (wrap ? at(v) : at(1 - Math.abs(2 * fract(v) - 1)));
  return { name, at, cyclic };
}

// --- noise (noise.rs): u32 hashes and smooth value noise ---

function hash(value) {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

function hash01(seed, i) {
  const lo = i >>> 0;
  const hi = i < 0 ? 0xffffffff : Math.floor(i / 2 ** 32) >>> 0;
  return (hash((seed ^ hash(lo ^ hash(hi))) >>> 0) >>> 8) / 2 ** 24;
}

const smooth = (t) => t * t * (3 - 2 * t);

function noise2(seed, x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = smooth(x - xi);
  const fy = smooth(y - yi);
  const row = (r) => (seed ^ ((hash(r >>> 0) + (r < 0 ? 0xffffffff : 0)) >>> 0)) >>> 0;
  const [r0, r1] = [row(yi), row(yi + 1)];
  const top = hash01(r0, xi) + (hash01(r0, xi + 1) - hash01(r0, xi)) * fx;
  const bottom = hash01(r1, xi) + (hash01(r1, xi + 1) - hash01(r1, xi)) * fx;
  return top + (bottom - top) * fy;
}

const fbm2 = (seed, x, y) =>
  clamp01(
    0.6 * noise2(seed, x, y) +
      0.4 * noise2((seed ^ 0x1b873593) >>> 0, x * 2.1 + 5.3, y * 2.1 + 1.7),
  );

// --- patterns (patterns.rs) ---

const smoothstep = (e0, e1, x) => smooth(clamp01((x - e0) / (e1 - e0)));
const scaled = (rgb, level) => {
  const gain = Math.pow(clamp01(level), 2.2);
  return rgb.map((c) => c * gain);
};

// Where `value` lies across the lights along `axis`, 0..1; the middle when they share it.
export function boundsOf(points) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const p of points)
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], p[axis]);
      max[axis] = Math.max(max[axis], p[axis]);
    }
  const across = (axis, value) => {
    const span = max[axis] - min[axis];
    return span < 1e-3 ? 0.5 : clamp01((value - min[axis]) / span);
  };
  return { min, max, across };
}

// Linear-light colour of one light at `loops` (direction left to right, defaults elsewhere).
export function colourAt(id, palette, pos, bounds, loops) {
  const phase = fract(loops);
  const x = bounds.across(0, pos[0]);
  const z = bounds.across(2, pos[2]);
  const { size, intensity } = DEFAULTS;
  switch (id) {
    case 'wave':
      return palette.cyclic(x * (0.6 + (1 - size) * 2.4) - phase);
    case 'gradient':
      return palette.at(0.5 + (x - 0.5) * (0.2 + 0.8 * size));
    case 'ocean': {
      const cycles = 0.8 + (1 - size) * 2.2;
      const swell = Math.sin(TAU * (x * cycles - phase));
      const chop = Math.sin(TAU * (z * 0.9 + x * 0.6 * cycles + phase * 0.7));
      const foam = fbm2(0x0cea, x * 4, loops * 0.8);
      const v = 0.5 + 0.28 * swell + 0.14 * chop + 0.2 * (foam - 0.5);
      return scaled(palette.at(v), 0.72 + 0.28 * (0.5 + 0.5 * swell));
    }
    case 'aurora': {
      const hue = fbm2(0xa0a0, x * 1.8 + loops * 0.3, loops * 0.15);
      const curtain = fbm2(0xa1a1, x * 3.2 - loops * 0.25, z + loops * 0.1);
      const open = 0.55 - 0.35 * intensity;
      return scaled(palette.at(hue), 0.08 + 0.92 * smoothstep(open - 0.15, open + 0.3, curtain));
    }
    case 'plasma': {
      const k = 1.5 + (1 - size) * 4;
      const a = Math.sin(x * k * Math.PI + TAU * phase);
      const b = Math.sin((z * 1.3 + x * 0.6) * k * Math.PI - TAU * phase * 1.3);
      return palette.cyclic(0.5 + 0.25 * (a + b));
    }
    default:
      throw new Error(`no pattern for ${id}`);
  }
}

// A few whole lamps are never all dark while the brightness is up: if even the brightest shows
// less than Hue can, every lamp is raised by one factor until it does (brightness 1).
const SPARSE_FLOOR = srgbToLinear(Math.ceil(Math.pow(0.02, 1 / 2.2) * 255) / 255);

export function keepOneLit(lit, palette, us) {
  const peak = (rgb) => Math.max(...rgb);
  const level = Math.max(0, ...lit.map(peak));
  if (level >= SPARSE_FLOOR) return lit;
  if (level > 1e-6)
    return lit.map((rgb) => rgb.map((c) => Math.min(1, (c * SPARSE_FLOOR) / level)));
  return us.map((u) => {
    const colour = palette.at(u);
    const own = peak(colour);
    return own > 0 ? colour.map((c) => (c * SPARSE_FLOOR) / own) : [0, 0, 0];
  });
}
