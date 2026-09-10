import { Mesh } from "three";
import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { StructureGeometry } from "../types/anatomy";
export function StructureMesh({
  geometry,
  opacity = 1,
  selected = false,
  onSelect,
  interactive = true,
}: {
  geometry: StructureGeometry;
  opacity?: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const canvas = useThree((state) => state.gl.domElement);
  useEffect(() => {
    if (!hovered) return;
    canvas.style.cursor = "pointer";
    return () => {
      canvas.style.cursor = "grab";
    };
  }, [hovered, canvas]);
  useEffect(() => {
    if (opacity <= 0.32) setHovered(false);
  }, [opacity]);
  function hover(event: ThreeEvent<PointerEvent>, value: boolean) {
    if (!interactive) return;
    event.stopPropagation();
    setHovered(value);
  }
  return (
    <group
      name={geometry.id}
      visible={opacity > 0.008}
      onPointerOver={(e) => hover(e, true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        if (interactive && onSelect && e.delta < 5) {
          e.stopPropagation();
          onSelect(geometry.id);
        }
      }}
    >
      {geometry.parts.map((part, index) => (
        <mesh
          key={index}
          position={part.position}
          scale={part.scale}
          rotation={part.rotation}
          raycast={
            interactive && opacity > 0.32 ? Mesh.prototype.raycast : () => {}
          }
        >
          {part.shape === "torus" ? (
            <torusGeometry args={[1, 0.11, 8, 40]} />
          ) : part.shape === "capsule" ? (
            <capsuleGeometry args={[1, 1, 6, 12]} />
          ) : (
            <sphereGeometry args={[1, 24, 16]} />
          )}
          <meshStandardMaterial
            color={selected ? "#accfca" : geometry.color}
            roughness={0.62}
            metalness={0.04}
            transparent={opacity < 0.999}
            opacity={opacity}
            depthWrite={opacity > 0.95}
            emissive={selected || hovered ? "#477c75" : "#000000"}
            emissiveIntensity={hovered ? 0.3 : selected ? 0.2 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}
