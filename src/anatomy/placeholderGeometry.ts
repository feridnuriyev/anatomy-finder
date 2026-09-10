import type { PrimitivePart, StructureGeometry, Vec3 } from "../types/anatomy";
const ellipsoid = (
  position: Vec3,
  scale: Vec3,
  rotation?: Vec3,
): PrimitivePart => ({ position, scale, rotation });
const segment = (a: Vec3, b: Vec3, radius: number): PrimitivePart => {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  return {
    position: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2],
    scale: [radius, Math.hypot(dx, dy) / 3, radius],
    rotation: [0, 0, -Math.atan2(dx, dy)],
    shape: "capsule",
  };
};
const shell: PrimitivePart[] = [
  ellipsoid([0, 2.64, 0], [0.34, 0.44, 0.32]),
  ellipsoid([0, 2.13, 0], [0.17, 0.25, 0.18]),
  ellipsoid([0, 1.48, 0], [0.66, 0.69, 0.31]),
  ellipsoid([0, 0.83, 0], [0.43, 0.49, 0.26]),
  ellipsoid([0, 0.38, 0], [0.52, 0.36, 0.32]),
];
for (const s of [-1, 1])
  shell.push(
    ellipsoid([s * 0.65, 1.87, 0], [0.26, 0.28, 0.27]),
    segment([s * 0.71, 1.81, 0], [s * 0.95, 0.91, 0], 0.19),
    segment([s * 0.95, 0.86, 0], [s * 1.13, 0.03, 0.02], 0.135),
    ellipsoid([s * 1.17, -0.19, 0.03], [0.135, 0.25, 0.08], [0, 0, s * 0.13]),
    segment([s * 0.29, 0.22, 0], [s * 0.34, -1.03, 0], 0.245),
    segment([s * 0.34, -1.12, 0], [s * 0.35, -2.29, 0.01], 0.17),
    ellipsoid([s * 0.35, -2.47, 0.16], [0.18, 0.16, 0.34]),
  );
for (const s of [-1, 1])
  shell.push(
    ellipsoid([s * 0.95, 0.88, 0], [0.145, 0.18, 0.145]),
    ellipsoid([s * 0.34, -1.08, 0], [0.175, 0.2, 0.18]),
    ellipsoid([s * 0.35, -2.3, 0.02], [0.12, 0.18, 0.13]),
    ellipsoid([s * 1.13, 0, 0.02], [0.1, 0.15, 0.09]),
    ellipsoid([s * 0.29, 0.1, 0], [0.25, 0.3, 0.25]),
  );
const boneColor = "#dfd9c3";
export const placeholderGeometry: StructureGeometry[] = [
  { id: "skin", color: "#b7aaa0", parts: shell },
  {
    id: "muscles",
    color: "#a45c58",
    parts: shell
      .map((part, index) => ({
        ...part,
        scale: part.scale.map((v) => v * 0.94) as Vec3,
        ...(index === 2 ? { scale: [0.62, 0.64, 0.29] as Vec3 } : {}),
      }))
      .concat(
        [-1, 1].flatMap((s) => [
          ellipsoid([s * 0.29, 1.7, 0.28], [0.3, 0.25, 0.08]),
          ...Array.from({ length: 4 }, (_, i) =>
            ellipsoid([s * 0.16, 1.28 - i * 0.2, 0.25], [0.14, 0.095, 0.075]),
          ),
        ]),
      ),
  },
  {
    id: "brain",
    color: "#cda5ac",
    parts: [
      ellipsoid([-0.14, 2.7, 0.03], [0.17, 0.25, 0.24]),
      ellipsoid([0.14, 2.7, 0.03], [0.17, 0.25, 0.24]),
    ],
  },
  {
    id: "lungs",
    color: "#b78788",
    parts: [
      ellipsoid([-0.29, 1.57, 0.07], [0.25, 0.47, 0.22], [0, 0, -0.13]),
      ellipsoid([0.29, 1.57, 0.07], [0.25, 0.47, 0.22], [0, 0, 0.13]),
    ],
  },
  {
    id: "heart",
    color: "#b84f50",
    parts: [ellipsoid([0.09, 1.35, 0.29], [0.19, 0.25, 0.16], [0, 0, -0.35])],
  },
  {
    id: "liver",
    color: "#805853",
    parts: [ellipsoid([-0.2, 0.9, 0.14], [0.35, 0.18, 0.22], [0, 0, -0.18])],
  },
  {
    id: "stomach",
    color: "#d1a07a",
    parts: [ellipsoid([0.24, 0.71, 0.13], [0.18, 0.25, 0.19], [0, 0, -0.4])],
  },
  {
    id: "kidneys",
    color: "#ab7460",
    parts: [
      ellipsoid([-0.26, 0.56, -0.13], [0.1, 0.17, 0.09]),
      ellipsoid([0.26, 0.56, -0.13], [0.1, 0.17, 0.09]),
    ],
  },
  {
    id: "skull",
    color: boneColor,
    parts: [
      ellipsoid([0, 2.72, -0.025], [0.3, 0.35, 0.27]),
      ellipsoid([0, 2.44, 0.08], [0.21, 0.16, 0.19]),
      ellipsoid([-0.145, 2.56, 0.19], [0.08, 0.085, 0.09]),
      ellipsoid([0.145, 2.56, 0.19], [0.08, 0.085, 0.09]),
    ],
  },
  {
    id: "spine",
    color: boneColor,
    parts: Array.from({ length: 19 }, (_, i) =>
      ellipsoid(
        [0, 2.15 - i * 0.099, -0.16 + Math.sin(i * 0.25) * 0.04],
        [0.095, 0.043, 0.105],
      ),
    ),
  },
  {
    id: "ribs",
    color: boneColor,
    parts: [
      ...Array.from({ length: 9 }, (_, i) => ({
        position: [0, 1.91 - i * 0.095, -0.025] as Vec3,
        scale: [0.25 + Math.sin((i / 9) * Math.PI) * 0.3, 0.17, 0.24] as Vec3,
        rotation: [Math.PI / 2, 0, 0] as Vec3,
        shape: "torus" as const,
      })),
      segment([0, 1.93, 0.24], [0, 1.28, 0.24], 0.045),
      segment([-0.57, 2.0, 0], [0, 2.07, 0.05], 0.055),
      segment([0, 2.07, 0.05], [0.57, 2.0, 0], 0.055),
    ],
  },
  {
    id: "pelvis",
    color: boneColor,
    parts: [
      ellipsoid([-0.25, 0.39, -0.06], [0.24, 0.27, 0.14], [0, 0, -0.3]),
      ellipsoid([0.25, 0.39, -0.06], [0.24, 0.27, 0.14], [0, 0, 0.3]),
      { position: [0, 0.24, 0.02], scale: [0.3, 0.19, 0.22], shape: "torus" },
    ],
  },
];
for (const s of [-1, 1]) {
  const side = s === 1 ? "left" : "right";
  for (const [name, a, b, r] of [
    ["humerus", [s * 0.65, 1.91, 0], [s * 0.94, 0.92, 0], 0.073],
    ["radius", [s * 0.99, 0.86, 0.035], [s * 1.16, 0.05, 0.035], 0.041],
    ["ulna", [s * 0.89, 0.87, -0.035], [s * 1.08, 0.06, -0.035], 0.037],
    ["femur", [s * 0.27, 0.29, 0], [s * 0.34, -1.04, 0], 0.091],
    ["tibia", [s * 0.32, -1.14, 0], [s * 0.33, -2.3, 0], 0.065],
    ["fibula", [s * 0.44, -1.15, -0.02], [s * 0.45, -2.28, -0.02], 0.032],
  ] as [string, Vec3, Vec3, number][])
    placeholderGeometry.push({
      id: `${side}-${name}`,
      color: boneColor,
      parts: [
        segment(a, b, r),
        ellipsoid(a, [r * 1.45, r * 1.3, r * 1.4]),
        ellipsoid(b, [r * 1.45, r * 1.3, r * 1.4]),
      ],
    });
}
