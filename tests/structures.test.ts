import { test } from "node:test";
import assert from "node:assert/strict";
import { structures } from "../src/data/placeholderStructures.ts";
import { placeholderGeometry } from "../src/anatomy/placeholderGeometry.ts";
test("procedural fallbacks retain their metadata and geometry", () => {
  assert.equal(new Set(structures.map((s) => s.id)).size, structures.length);
  assert.equal(
    new Set(placeholderGeometry.map((g) => g.id)).size,
    placeholderGeometry.length,
  );
  for (const structure of structures) {
    assert.ok(placeholderGeometry.some((g) => g.id === structure.id));
    assert.equal(structure.modelObjectName, structure.id);
    for (const related of structure.related)
      assert.ok(structures.some((s) => s.id === related));
  }
});
test("geometry remains finite and all four layers have assets", () => {
  for (const layer of ["skin", "muscles", "organs", "skeleton"])
    assert.ok(structures.some((s) => s.layer === layer));
  for (const geometry of placeholderGeometry)
    for (const part of geometry.parts) {
      assert.ok(part.position.every(Number.isFinite));
      assert.ok(
        part.scale.every((value) => Number.isFinite(value) && value > 0),
      );
    }
});
