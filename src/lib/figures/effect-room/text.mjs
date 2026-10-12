// Readout and screen-reader text for the Effect figure.
import { LAMPS, STRIP } from './layout.mjs';
import { loopsPerSec } from './model.mjs';

const motion = ({ effect, speed }) =>
  effect === 'gradient'
    ? 'holds still'
    : `one loop ${(1 / loopsPerSec(effect, speed)).toFixed(1)} s`;

export const readoutOf = (state) => `${state.effect} · ${state.palette} · ${motion(state)}`;

export const valueTextOf = (state) =>
  `${state.effect} with the ${state.palette} palette at speed ${Math.round(state.speed * 100)} %, across ${STRIP.length} strip LEDs and ${LAMPS.length} Hue lights; ${motion(state)}.`;
