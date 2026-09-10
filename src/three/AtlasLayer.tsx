import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { atlasManifest } from "../data/atlasManifest";
import { AtlasMeshes } from "./AtlasMeshes";
import { AtlasBoundary } from "./AtlasBoundary";
import { useAtlasStatus } from "../hooks/useAtlasStatus";
import type { Layer } from "../types/anatomy";
import type { ReactNode } from "react";
import type { CatalogPose } from "../anatomy/catalogLayout";
interface ArrangementProps {poses:Record<string,CatalogPose>;explosion:number;}

const layerNames=Object.fromEntries(Object.keys(atlasManifest.layers).map(layer=>[layer,atlasManifest.structures.filter(s=>s.layer===layer&&!s.isGroup).map(s=>s.id)])) as Record<Layer,string[]>;
function LoadedLayer({layer,opacity,selectedNames,onSelect,isolated,poses,explosion}:{layer:Layer;opacity:number;selectedNames:string[];onSelect:(id:string)=>void;isolated:boolean}&ArrangementProps) {
  const {nodes}=useGLTF(atlasManifest.layers[layer].url);
  const {report}=useAtlasStatus();
  useEffect(()=>{report(layer,"ready");},[layer,report]);
  return <AtlasMeshes nodes={nodes} names={isolated?selectedNames:layerNames[layer]} opacity={isolated?1:opacity} selectedNames={selectedNames} onSelect={onSelect} poses={poses} explosion={isolated?0:explosion}/>;
}
export function AtlasLayer({layer,opacity,selectedNames,onSelect,isolated,shouldLoad,fallback,poses,explosion}:{layer:Layer;opacity:number;selectedNames:string[];onSelect:(id:string)=>void;isolated:boolean;shouldLoad:boolean;fallback:ReactNode}&ArrangementProps) {
  const [requested,setRequested]=useState(shouldLoad);
  const {report,retries}=useAtlasStatus();
  const retryToken=retries[layer];
  useEffect(()=>{if(shouldLoad)setRequested(true);},[shouldLoad]);
  useEffect(()=>{if(requested)report(layer,"loading");},[requested,layer,report,retryToken]);
  if(!requested)return null;
  return <AtlasBoundary retryToken={retryToken} onFailure={()=>report(layer,"fallback")} fallback={fallback}><Suspense fallback={null}><LoadedLayer layer={layer} opacity={opacity} selectedNames={selectedNames} onSelect={onSelect} isolated={isolated} poses={poses} explosion={explosion}/></Suspense></AtlasBoundary>;
}
