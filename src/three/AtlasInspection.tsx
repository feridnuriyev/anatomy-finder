import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import type { ComponentRef } from "react";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Box3, MathUtils, Mesh, PerspectiveCamera, Sphere, Vector3 } from "three";
import { atlasManifest } from "../data/atlasManifest";
import { AtlasMeshes } from "./AtlasMeshes";
import { AtlasBoundary } from "./AtlasBoundary";
import { useAtlasStatus } from "../hooks/useAtlasStatus";
import type { AtlasStructure } from "../types/atlas";

function LoadedInspection({structure}:{structure:AtlasStructure}) {
  const {nodes}=useGLTF(atlasManifest.layers[structure.layer].url);
  const frame=useMemo(()=>{
    const bounds=new Box3();
    for(const name of structure.meshNames){
      const node=nodes[name];
      if(!(node instanceof Mesh))continue;
      node.geometry.computeBoundingBox();
      if(node.geometry.boundingBox)bounds.union(node.geometry.boundingBox);
    }
    if(bounds.isEmpty())return {center:new Vector3(),radius:1};
    return {
      center:bounds.getCenter(new Vector3()),
      radius:Math.max(bounds.getBoundingSphere(new Sphere()).radius,.001),
    };
  },[nodes,structure.meshNames]);
  return <><group position={[-frame.center.x,-frame.center.y,-frame.center.z]}><AtlasMeshes nodes={nodes} names={structure.meshNames} interactive={false}/></group><InspectionControls radius={frame.radius}/></>;
}

function InspectionControls({radius}:{radius:number}) {
  const controls=useRef<ComponentRef<typeof OrbitControls>>(null);
  const {camera,size,invalidate}=useThree();
  useLayoutEffect(()=>{
    if(!(camera instanceof PerspectiveCamera))return;
    const verticalHalfFov=MathUtils.degToRad(camera.fov)/2;
    const horizontalHalfFov=Math.atan(Math.tan(verticalHalfFov)*Math.max(size.width/Math.max(size.height,1),.01));
    const limitingHalfFov=Math.min(verticalHalfFov,horizontalHalfFov);
    const distance=(radius/Math.max(Math.sin(limitingHalfFov),.01))*1.18;
    camera.position.set(0,0,distance);
    camera.near=Math.max(distance-radius*3,.001);
    camera.far=distance+radius*12;
    camera.lookAt(0,0,0);
    camera.updateProjectionMatrix();
    controls.current?.target.set(0,0,0);
    controls.current?.update();
    invalidate();
  },[camera,invalidate,radius,size.height,size.width]);
  return <OrbitControls ref={controls} makeDefault target={[0,0,0]} enablePan={false} enableDamping dampingFactor={0.08} minDistance={radius*.35} maxDistance={radius*12} rotateSpeed={0.7}/>;
}

export function AtlasInspection({structure}:{structure:AtlasStructure}) {
  const {report,retries}=useAtlasStatus();
  return <AtlasBoundary retryToken={retries[structure.layer]} onFailure={()=>report(structure.layer,"fallback")} fallback={<Html center><p className="model-message">Model unavailable. Use Retry in the body view.</p></Html>}><Suspense fallback={<Html center><p className="model-message">Loading {structure.name.toLowerCase()}…</p></Html>}><LoadedInspection structure={structure}/></Suspense></AtlasBoundary>;
}
