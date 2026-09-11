# Anatomy Finder

An interactive, browser-based 3D anatomy explorer built with React, TypeScript, and Three.js.

**Live demo:** [anatomy-finder.pages.dev](https://anatomy-finder.pages.dev/)

> This project is an educational visualization and is not intended for medical diagnosis, treatment, or clinically accurate instruction.

## Features

- Explore skin, muscles, organs, and skeleton layers through a continuous depth control.
- Rotate the main model and inspect individual structures in an independent 3D viewer.
- Expand the anatomy into a parts atlas while preserving the main scene.
- Use an orientation gizmo that follows the model rotation.
- Select structures directly in the scene or through accessible controls.
- Supports system color-scheme preference, keyboard interaction, touch rotation, and responsive layouts.

## Technology

- React 19 and TypeScript
- Vite
- Three.js, React Three Fiber, and Drei
- Cloudflare Pages

## Getting started

### Prerequisites

- Node.js 22.12 or later (Node.js 24 recommended)
- pnpm

### Install and run

```bash
pnpm install
pnpm dev
```

Open the local address printed by Vite, normally `http://127.0.0.1:5173`.

### Quality checks

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

## Controls

| Action | Control |
| --- | --- |
| Rotate the main model | Drag in the main viewport |
| Move through anatomy layers | Scroll in the main viewport or use the depth control |
| Select a structure | Click a visible structure or use the selector |
| Inspect a selected structure | Drag in its dedicated inspection viewer |
| Reset the scene | Use **Reset view** or press `Escape` to close an inspection |

## Project structure

```text
src/
  anatomy/      Depth mathematics and geometry definitions
  app/          Application composition and state ownership
  components/   Accessible controls and interface panels
  data/         Renderer-independent anatomical metadata
  hooks/        Input and selection hooks
  styles/       Responsive visual system
  three/        3D canvas, cameras, lighting, and interaction
  types/        Shared contracts
tests/          Data and depth invariants
```

## Deployment

The production site is deployed to Cloudflare Pages. Build the static site with `pnpm build`; the output is written to `dist/`.

## Models and attribution

The bundled anatomy assets are derived from **BodyParts3D 4.0** and are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [the complete attribution notice](public/models/bodyparts3d/ATTRIBUTION.txt) for source details, transformations, and licensing notes.

The models are illustrative visualization assets. They are not clinically validated anatomical models.

## License

The original source code in this repository is available under the [MIT License](LICENSE). Third-party assets, including the BodyParts3D-derived models, retain their own licenses and attribution requirements.
