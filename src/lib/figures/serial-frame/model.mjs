// The LumaSync v1 LED frame as the app encodes it (encode_led_packet_with_corrections in
// src-tauri/src/commands/led_output.rs). At the default corrections, saturation 1.0 and 6500 K
// are identities, so only the gamma 2.2 table touches the colours.

const f32 = Math.fround;

export const BAUD = 115_200;
// 8N1 on the wire: a start bit, eight data bits and a stop bit per byte.
export const BITS_PER_BYTE = 10;

// The app builds this table in f32; rounding through f32 keeps every entry byte-exact.
export const GAMMA_LUT = Array.from({ length: 256 }, (_, i) =>
  Math.round(f32(f32(Math.pow(f32(i / 255), f32(2.2))) * 255)),
);

export const HEADER_BYTES = 5;

export function encodeFrame(brightness, colours) {
  const level = Math.floor(f32(f32(Math.min(1, Math.max(0, brightness))) * 255));
  const count = Math.min(colours.length, 0xffff);
  const bytes = [0xaa, 0x55, level, count & 0xff, count >> 8];
  for (const [r, g, b] of colours) bytes.push(GAMMA_LUT[r], GAMMA_LUT[g], GAMMA_LUT[b]);
  bytes.push(bytes.reduce((sum, byte) => sum ^ byte, 0));
  return bytes;
}

export const frameBytes = (leds, bytesPerLed = 3) => HEADER_BYTES + leds * bytesPerLed + 1;

export const wireMs = (bytes) => (bytes * BITS_PER_BYTE * 1000) / BAUD;

const CHANNELS = ['red', 'green', 'blue'];

// What byte `index` of a frame carrying `leds` LEDs holds.
export function fieldOf(index, leds) {
  if (index < 2) return { kind: 'magic', name: 'magic' };
  if (index === 2) return { kind: 'brightness', name: 'brightness' };
  if (index === 3) return { kind: 'count', name: 'LED count, low byte' };
  if (index === 4) return { kind: 'count', name: 'LED count, high byte' };
  const payload = index - HEADER_BYTES;
  if (payload < leds * 3) {
    const led = Math.floor(payload / 3);
    const channel = CHANNELS[payload % 3];
    return { kind: channel, name: `LED ${led + 1} ${channel}`, led, channel: payload % 3 };
  }
  return { kind: 'checksum', name: 'checksum' };
}

// XOR of bytes 0..index: what a receiver has accumulated once that byte is in.
export const xorThrough = (bytes, index) =>
  bytes.slice(0, index + 1).reduce((sum, byte) => sum ^ byte, 0);

export const hex = (byte) => byte.toString(16).toUpperCase().padStart(2, '0');
