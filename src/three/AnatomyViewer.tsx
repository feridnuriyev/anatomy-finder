import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { HumanModel } from "./HumanModel";
import type { Layer } from "../types/anatomy";
import { SceneBoundary } from "../components/SceneBoundary";
export function Lighting() {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 5]} intensity={2.7} />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={1.8}
        color="#8fafbe"
      />
      <pointLight position={[-3, 0, 4]} intensity={12} />
    </>
  );
}
export function AnatomyViewer({
  depth,
  selectedId,
  isolated,
  onSelect,
  resetKey,
  visibleLayers,
  explosion,
}: {
  depth: number;
  selectedId?: string;
  isolated: boolean;
  onSelect: (id: string) => void;
  resetKey: number;
  visibleLayers: Layer[] | null;
  explosion: number;
}) {
  return (
    <SceneBoundary>
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0.3, 9.2], fov: 43 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
      >
        <Lighting />
        <Suspense
          fallback={
            <Html center>
              <span className="loading">Preparing anatomy…</span>
            </Html>
          }
        >
          <HumanModel
            depth={depth}
            selectedId={selectedId}
            isolated={isolated}
            onSelect={onSelect}
            visibleLayers={visibleLayers}
            explosion={explosion}
            resetKey={resetKey}
          />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
