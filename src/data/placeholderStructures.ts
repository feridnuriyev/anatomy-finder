import type { AnatomicalStructure, Layer } from "../types/anatomy";
const entries: [string, string, Layer, string][] = [
  ["skin", "Body surface", "skin", "Whole body"],
  ["muscles", "Muscle groups", "muscles", "Whole body"],
  ["brain", "Brain", "organs", "Head"],
  ["lungs", "Lungs", "organs", "Chest"],
  ["heart", "Heart", "organs", "Chest"],
  ["liver", "Liver", "organs", "Upper abdomen"],
  ["stomach", "Stomach", "organs", "Upper abdomen"],
  ["kidneys", "Kidneys", "organs", "Abdomen"],
  ["skull", "Skull", "skeleton", "Head"],
  ["spine", "Spine", "skeleton", "Back"],
  ["ribs", "Rib cage", "skeleton", "Chest"],
  ["pelvis", "Pelvis", "skeleton", "Hip region"],
  ...(["left", "right"] as const).flatMap((side) =>
    (["humerus", "radius", "ulna", "femur", "tibia", "fibula"] as const).map(
      (bone) =>
        [
          `${side}-${bone}`,
          `${side[0].toUpperCase() + side.slice(1)} ${bone}`,
          "skeleton",
          ["humerus", "radius", "ulna"].includes(bone) ? "Arm" : "Leg",
        ] as [string, string, Layer, string],
    ),
  ),
];
export const structures: AnatomicalStructure[] = entries.map(
  ([id, name, layer, location]) => ({
    id,
    name,
    layer,
    location,
    system:
      layer === "skeleton"
        ? "Skeletal system"
        : layer === "muscles"
          ? "Muscular system"
          : layer === "skin"
            ? "Body surface"
            : "Organ collection",
    description:
      "Illustrative geometry for exploring the interface. Shape, scale and placement are simplified; this is not a medical reference.",
    function:
      "Placeholder field — verified anatomical content will be added with a curated data source.",
    related:
      layer === "skeleton"
        ? ["spine", "pelvis"].filter((item) => item !== id)
        : [],
    modelObjectName: id,
  }),
);
