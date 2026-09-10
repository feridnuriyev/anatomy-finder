# Validation — 2026-09-09

- Dependency installation completed with pnpm 11.19.0 / Node 24.19.0, including esbuild's approved installation script.
- `pnpm typecheck`: passed.
- `pnpm test`: all 5 tests passed (bounds, wheel normalization, continuous fades, metadata mappings, finite geometry).
- `pnpm build`: passed; renderer split into a separate Three.js chunk.
- Vite development server returned HTTP 200 and rendered the full humanoid scene.
- Browser checks: default Skin view, drag orbit, forward/reverse wheel depth, all four layers, direct skull raycasting, selected highlight, separate inspection Canvas, femur selection, details, isolation, close and reset.
- Responsive inspection checked at a narrow mobile-sized viewport, including scrollable details and accessible structure selection.
- Optional `explore_anatomy` browser tool registered, selected the left femur, and rejected an out-of-range depth without corrupting state.

During development, checks found and resolved a hidden-mesh raycast restoration bug, a transitive TypeScript type import and package-manager setup issues. A transient hook-order error during hot reload disappeared after a clean reload; the final startup and interaction checks used the reloaded app. No new runtime errors were observed in that final sequence.

Physical touch/pinch devices and external GLB/GLTF assets have not been tested. All anatomy remains explicitly illustrative.
