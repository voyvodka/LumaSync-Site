// One moment of the effect: the colour of every panel tile, strip LED and lamp.
import { BOUNDS, LAMPS, PANEL, STRIP } from './layout.mjs';
import { bytesFromLinear, colourAt, keepOneLit, paletteOf } from './model.mjs';

export const rgb = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

// What the figure shows first: Wave over the rainbow palette at speed 0.7, the app's defaults otherwise.
export const INITIAL = { effect: 'wave', palette: 'rainbow', speed: 0.7, loops: 0.25 };

// Tile centres back in the room cube, on the TV wall.
export function cellCentres() {
  const { x0, x1, z0, z1, columns, rows } = PANEL;
  const centres = [];
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++) {
      const x = x0 + ((column + 0.5) / columns) * (x1 - x0);
      const z = z1 - ((row + 0.5) / rows) * (z1 - z0);
      centres.push([x / 100, 1, z / 65 - 1]);
    }
  return centres;
}

const palettes = new Map();
const paletteNamed = (name) => {
  if (!palettes.has(name)) palettes.set(name, paletteOf(name));
  return palettes.get(name);
};

// Linear light for the lamps, so the live script can smooth them the way the app smooths Hue.
export function lampTargets({ effect, palette, loops }) {
  const p = paletteNamed(palette);
  const lit = LAMPS.map((lamp) => colourAt(effect, p, lamp.pos, BOUNDS, loops));
  return keepOneLit(
    lit,
    p,
    LAMPS.map((lamp) => lamp.u),
  );
}

export function coloursAt(state, centres, out = {}) {
  const p = paletteNamed(state.palette);
  const draw = (pos) => bytesFromLinear(colourAt(state.effect, p, pos, BOUNDS, state.loops));
  out.cells = centres.map(draw);
  out.strip = STRIP.map(draw);
  out.lamps = lampTargets(state).map(bytesFromLinear);
  return out;
}
