import type { Vec3 } from "../types/anatomy.ts";

export interface CatalogItem { id:string; bounds?:Vec3[]; }
export interface CatalogPose { position:Vec3; scale:number; }
export interface CatalogFrame { width:number; height:number; }
export function catalogLayout(items:CatalogItem[], aspect:number) {
  const columns=Math.max(1,Math.ceil(Math.sqrt(items.length*Math.max(.4,aspect))));
  const rows=Math.ceil(items.length/columns);
  const spacing=.85;
  const poses:Record<string,CatalogPose>={};
  items.forEach((item,index)=>{
    const min=item.bounds?.[0]??[-.5,-.5,-.5];
    const max=item.bounds?.[1]??[.5,.5,.5];
    const scale=.62/Math.max(.001,...max.map((v,i)=>v-min[i]));
    const center=min.map((v,i)=>(v+max[i])/2);
    poses[item.id]={scale,position:[((index%columns)-(columns-1)/2)*spacing-center[0]*scale,((rows-1)/2-Math.floor(index/columns))*spacing+.15-center[1]*scale,-center[2]*scale]};
  });
  return {poses,width:columns*spacing,height:rows*spacing};
}

/** Fit the atlas inside the unobstructed center of the interface. */
export function catalogCameraDistance(
  frame: CatalogFrame,
  aspect: number,
  verticalFovDegrees = 43,
  safeWidthRatio = .76,
  safeHeightRatio = .76,
) {
  const boundedAspect = Math.max(.2, aspect);
  const boundedWidth = Math.min(1, Math.max(.2, safeWidthRatio));
  const boundedHeight = Math.min(1, Math.max(.2, safeHeightRatio));
  const requiredHeight = Math.max(
    frame.height / boundedHeight,
    frame.width / (boundedAspect * boundedWidth),
  );
  return requiredHeight / (2 * Math.tan(verticalFovDegrees * Math.PI / 360)) * 1.2;
}
