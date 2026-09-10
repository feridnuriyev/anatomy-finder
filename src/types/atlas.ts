import type { Layer, Vec3 } from "./anatomy";

export interface AtlasStructure {
  id: string;
  name: string;
  sourceName: string;
  fmaId: string;
  layer: Layer;
  elementIds: string[];
  parentNames: string[];
  meshNames: string[];
  isGroup: boolean;
  vertexCount?: number;
  triangleCount?: number;
  sourceTriangleCount?: number;
  simplificationError?: number;
  bounds?: Vec3[];
}
export interface AtlasManifest {
  dataset: string;
  version: string;
  sourceUrl: string;
  licenseUrl: string;
  retrievedOn: string;
  transform: { sourceCenterMm: number[]; scale: number; axisMapping: string };
  layers: Record<Layer, { url: string; bytes: number; structureCount: number; triangleCount: number }>;
  structures: AtlasStructure[];
  sourceHashes: Record<string, string>;
}
