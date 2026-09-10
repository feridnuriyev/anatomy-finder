# Anatomy Finder

An immersive, local-first React/TypeScript 3D anatomy explorer. Its current assets are illustrative procedural placeholders, not medical models.

## Architecture and responsibilities

- `src/app`: application composition and ownership of depth, selection and inspection state.
- `src/hooks`: input normalization and independent state hooks. Wheel depth is captured only within the main viewport; page/panel scrolling must remain usable.
- `src/anatomy`: pure depth mathematics and replaceable procedural geometry definitions.
- `src/data`: renderer-independent anatomical metadata. Never import Three.js here.
- `src/types`: shared structure and rendering contracts. IDs are stable, unique and match model object names.
- `src/three`: Canvas, lighting, camera, grouped layer rendering, raycast events and inspection rendering.
- `src/components`: accessible DOM controls and information panels.
- `src/styles`: responsive app layout and visual system.
- `tests`: meaningful invariants around depth and data contracts.

## Conventions

Use strict TypeScript, descriptive names and small components. Avoid `any`, unnecessary dependencies and global state frameworks. Preserve React StrictMode. Keep state changes separate from mesh rendering; geometry must not contain medical prose. Each anatomical layer stays independently controllable. Never merge all anatomical meshes into one asset. Restore the actual mesh raycast method when enabling a previously hidden mesh.

Use stable structure IDs, explicit layer membership and matching `modelObjectName`. Missing metadata/models must degrade gracefully. Loaded assets must be lazy, bounded by Suspense and an error boundary, and fall back to procedural geometry. Dispose cloned materials without disposing shared GLTF resources. Do not preload large datasets globally.

## Medical content

Do not invent medical facts or imply these placeholders are accurate. Label example information explicitly. Curated medical content requires verifiable sources and appropriate licensing. Preserve separation between anatomy metadata and rendering, including when importing real GLB/GLTF assets.

## Future work and checks

Keep the full body visible alongside a selected structure by default. Isolation is an explicit action. Mouse wheel controls anatomy depth, touch can rotate/pinch, and the range input is the accessible alternative. Maintain keyboard navigation, visible focus, Escape to close and reduced-motion support. No backend, authentication or persistence without a user request.

Before finishing changes run `pnpm typecheck`, `pnpm test` and `pnpm build`. For interaction changes verify the scene in a browser: wheel forward/back, layer transitions, direct mesh selection, inspection, details, isolate, close and camera reset. Check a narrow viewport. Report any unverified behavior honestly. Do not deploy or introduce external assets as a substitute for completing the local project.
