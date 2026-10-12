// Readout and screen-reader text, shared by the build-time art and the live script.
import { FRAME, SCREEN, latchesAt } from './layout.mjs';
import { fieldOf, hex } from './model.mjs';

export function readoutAt(index) {
  const field = fieldOf(index, SCREEN.length);
  return `byte ${index} · ${field.name} ${hex(FRAME[index])} · xor ${hex(latchesAt(index))}`;
}

export function valueTextAt(index) {
  const field = fieldOf(index, SCREEN.length);
  const screen =
    field.led === undefined
      ? ''
      : `, from screen value ${SCREEN[field.led][field.channel]} through gamma 2.2`;
  return `Byte ${index} of ${FRAME.length}: ${field.name}, 0x${hex(FRAME[index])}${screen}. Running XOR 0x${hex(latchesAt(index))}.`;
}
