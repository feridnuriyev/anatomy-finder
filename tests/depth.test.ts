import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampDepth,
  currentLayer,
  layerOpacity,
  layers,
  wheelDelta,
} from "../src/anatomy/depth.ts";
test("depth stays bounded and handles invalid input", () => {
  assert.equal(clampDepth(-10), 0);
  assert.equal(clampDepth(150), 100);
  assert.equal(clampDepth(NaN), 0);
});
test("layer boundaries and reversible depth", () => {
  assert.deepEqual([0, 25, 50, 75, 100].map(currentLayer), [
    "skin",
    "muscles",
    "organs",
    "skeleton",
    "skeleton",
  ]);
  assert.equal(wheelDelta(100, 0), -wheelDelta(-100, 0));
  assert.ok(wheelDelta(10000, 0) <= 4);
  assert.equal(wheelDelta(1, 1), wheelDelta(16, 0));
});
test("fades are continuous, bounded and retain a visible layer", () => {
  for (let depth = 0; depth <= 100; depth += 0.25) {
    const values = layers.map((layer) => layerOpacity(layer, depth));
    assert.ok(values.every((v) => v >= 0 && v <= 1));
    assert.ok(Math.abs(values.reduce((a, b) => a + b, 0) - 1) < 0.00001);
    for (const layer of layers)
      assert.ok(
        Math.abs(
          layerOpacity(layer, depth) - layerOpacity(layer, depth + 0.01),
        ) < 0.01,
      );
  }
  assert.equal(layerOpacity("skin", 0), 1);
  assert.equal(layerOpacity("skeleton", 100), 1);
});
