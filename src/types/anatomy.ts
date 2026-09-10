export type Layer = "skin" | "muscles" | "organs" | "skeleton";
export interface AnatomicalStructure {
  id: string;
  name: string;
  system: string;
  layer: Layer;
  parent?: string;
  description: string;
  function: string;
  location: string;
  related: string[];
  modelObjectName: string;
  children?: string[];
  source?: {dataset:string;version:string;fmaId:string;url:string;licenseUrl:string;sourceName:string};
  contentSource?: {title:string;url:string;license:string};
}
export type Vec3 = [number, number, number];
export interface PrimitivePart {
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  shape?: "sphere" | "capsule" | "torus";
}
export interface StructureGeometry {
  id: string;
  color: string;
  parts: PrimitivePart[];
}
