import { Suspense, useMemo } from "react";
import { Bounds, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Mesh, Vector3 } from "three";
import { atlasManifest } from "../data/atlasManifest";
import { AtlasMeshes } from "./AtlasMeshes";
import { AtlasBoundary } from "./AtlasBoundary";
import { useAtlasStatus } from "../hooks/useAtlasStatus";
import type { AtlasStructure } from "../types/atlas";

function LoadedInspection({structure}:{structure:AtlasStructure}) {
  const {nodes}=useGLTF(atlasManifest.layers[structure.layer].url);
  const center=useMemo(()=>{
    const bounds=new Box3();
    for(const name of structure.meshNames){
      const node=nodes[name];
      if(!(node instanceof Mesh))continue;
      node.geometry.computeBoundingBox();
      if(node.geometry.boundingBox)bounds.union(node.geometry.boundingBox);
    }
    return bounds.isEmpty()?new Vector3():bounds.getCenter(new Vector3());
  },[nodes,structure.meshNames]);
  return <Bounds fit clip observe margin={1.45}><group position={[-center.x,-center.y,-center.z]}><AtlasMeshes nodes={nodes} names={structure.meshNames} interactive={false}/></group></Bounds>;
}
export function AtlasInspection({structure}:{structure:AtlasStructure}) {
  const {report,retries}=useAtlasStatus();
  return <><AtlasBoundary retryToken={retries[structure.layer]} onFailure={()=>report(structure.layer,"fallback")} fallback={<Html center><p className="model-message">Model unavailable. Use Retry in the body view.</p></Html>}><Suspense fallback={<Html center><p className="model-message">Loading {structure.name.toLowerCase()}…</p></Html>}><LoadedInspection structure={structure}/></Suspense></AtlasBoundary><OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={1} maxDistance={20} rotateSpeed={0.7}/></>;
}
