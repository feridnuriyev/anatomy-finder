import type { Layer } from "../types/anatomy.ts";
export const layers: Layer[] = ["skin", "muscles", "organs", "skeleton"];
export const clampDepth = (value: number) =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
export const currentLayer = (depth: number): Layer =>
  layers[Math.min(3, Math.floor(clampDepth(depth) / 25))];
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export function layerOpacity(layer: Layer, depth: number) {
  const i = layers.indexOf(layer);
  const enter = i === 0 ? 1 : smoothstep(i * 25 - 13, i * 25 + 5, depth);
  const leave =
    i === 3 ? 1 : 1 - smoothstep((i + 1) * 25 - 13, (i + 1) * 25 + 5, depth);
  return enter * leave;
}
export function wheelDelta(delta: number, mode: number) {
  return Math.max(
    -4,
    Math.min(4, delta * (mode === 1 ? 16 : mode === 2 ? 240 : 1) * 0.035),
  );
}
