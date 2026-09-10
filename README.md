# Anatomy Finder

A first working interactive 3D human anatomy explorer. The body is the primary interface: scroll through smooth skin → muscle → organ → skeleton transitions, rotate it, click structures, and inspect them beside the whole body.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended) and pnpm.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

`npm install` and the corresponding `npm run` commands also work if pnpm is unavailable; pnpm and its checked-in lockfile are the canonical workflow.

## Controls

- Drag the main body to orbit. Scroll downward to move inward and upward to restore outer layers. Wheel is reserved for depth in the main viewport.
- Use the layer buttons or depth slider for keyboard, tablet and mobile access. Arrow keys adjust the focused slider.
- Click visible structures or choose one from the accessible selector. At skeleton depth, select individual left/right long bones, skull, spine, rib cage or pelvis.
- The inspection area fits and displays a separate model while retaining the full body. Drag that model independently; wheel/pinch zoom is available there.
- **Isolate structure** filters the main scene; **Show full body** restores context. **···** toggles example metadata. **Reset** or Escape closes inspection. **Reset view** restores camera and surface depth.

## Technology and structure

React 19, TypeScript, Vite, Three.js, React Three Fiber and Drei. No backend or state framework.

```text
src/
  app/          App composition
  anatomy/      Pure depth math and procedural placeholder geometry
  components/   Depth, details, inspection and error UI
  data/         Anatomical metadata, independent of Three.js
  hooks/        Depth/wheel and structure selection state
  three/        Cameras, lighting, layer and mesh rendering
  types/        Shared anatomy and geometry contracts
  styles/       Full-screen desktop and mobile layouts
tests/          Depth behavior and metadata/geometry invariants
```

Depth is a continuous 0–100 value. A wheel target is clamped and per-event movement is capped; time-based interpolation produces smooth updates. Adjacent layer opacity curves overlap and sum to one. Four named layer groups remain separate. Selection uses stable IDs, not Three.js object references. A separate inspection Canvas gives the selected object its own fitted camera and orbit controls. The narrow layout becomes a bottom sheet.

## Current limitations

All geometry is procedural and deliberately simplified. Bone groups such as the spine and rib cage are selected as a unit. Organs use basic shapes; skin and muscles are assembled humanoid forms. There are no verified medical descriptions, diagnostic features or complete anatomical relationships. Models are not anatomically accurate and must not be used for medical decisions or instruction requiring accuracy. Metadata function fields explicitly say they are placeholders.

Transparency uses standard mesh alpha blending, so overlapping placeholder surfaces can exhibit sorting artifacts at intermediate depth. The 3D renderer is the largest dependency; no external model downloads are needed. A system font fallback works if the optional Google font cannot load. WebGL is required; a retry message appears if the renderer fails. Pinch behavior needs physical-device validation in addition to desktop responsive checks.

## Adding real anatomical assets

1. Obtain licensed, curated GLB/GLTF assets and record their license and attribution. Normalize units, origin and orientation to this scene (Y up, front toward +Z, body about 5.6 units tall).
2. Preserve separate skin, muscles, organs and skeleton groups, with individual selectable objects. Match names to `modelObjectName` and stable structure IDs in `src/data/structures.ts`.
3. Replace geometry at the `HumanModel`/`StructureMesh` boundary using a lazy `useGLTF` loader under Suspense. Keep placeholder geometry as the error/missing-object fallback. Clone materials before altering layer opacity or selected highlighting; do not mutate cached shared materials.
4. Supply the same structure resolver to `StructureViewer` so the isolated model and main body use matching assets and names. Preserve bounds fitting and independent inspection controls.
5. Enable Draco/Meshopt and KTX2 only as required by the actual asset pipeline; host decoder files locally. Load by layer or region, share geometry, and profile real models before introducing instancing or aggressive caching.
6. Add sourced metadata with provenance. Keep clinical content out of renderer components and cover missing mappings with tests.

Recommended next milestone: one licensed skeleton asset integrated through this boundary, with individually mapped bones, source attribution and curated metadata.
