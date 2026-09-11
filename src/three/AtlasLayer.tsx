import { Suspense, useCallback, useEffect, useState } from "react";
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
function LoadedLayer({layer,opacity,selectedNames,onSelect,isolated,poses,explosion,onReady}:{layer:Layer;opacity:number;selectedNames:string[];onSelect:(id:string)=>void;isolated:boolean;onReady:()=>void}&ArrangementProps) {
  const {nodes}=useGLTF(atlasManifest.layers[layer].url);
  const {report}=useAtlasStatus();
  useEffect(()=>{report(layer,"ready");onReady();},[layer,report,onReady]);
  return <AtlasMeshes nodes={nodes} names={isolated?selectedNames:layerNames[layer]} opacity={isolated?1:opacity} selectedNames={selectedNames} onSelect={onSelect} poses={poses} explosion={isolated?0:explosion}/>;
}
export function AtlasLayer({layer,opacity,selectedNames,onSelect,isolated,shouldLoad,fallback,poses,explosion}:{layer:Layer;opacity:number;selectedNames:string[];onSelect:(id:string)=>void;isolated:boolean;shouldLoad:boolean;fallback:ReactNode}&ArrangementProps) {
  const [requested,setRequested]=useState(shouldLoad);
  const [isReady,setIsReady]=useState(false);
  const [timedOut,setTimedOut]=useState(false);
  const {report,retries}=useAtlasStatus();
  const retryToken=retries[layer];
  const onReady=useCallback(()=>setIsReady(true),[]);
  useEffect(()=>{if(shouldLoad)setRequested(true);},[shouldLoad]);
  useEffect(()=>{if(requested)report(layer,"loading");},[requested,layer,report,retryToken]);
  useEffect(()=>{
    setIsReady(false);
    setTimedOut(false);
  },[retryToken]);
  useEffect(()=>{
    if(!requested||isReady||timedOut)return;
    const timeout=window.setTimeout(()=>{
      setTimedOut(true);
      report(layer,"fallback");
    },10000);
    return()=>window.clearTimeout(timeout);
  },[requested,isReady,timedOut,layer,report,retryToken]);
  if(!requested)return null;
  // Some Firefox-based browsers can leave a GLB request pending indefinitely.
  // Keep the explorer useful by showing its built-in 3D preview in that case.
  if(timedOut)return <>{fallback}</>;
  return <AtlasBoundary retryToken={retryToken} onFailure={()=>report(layer,"fallback")} fallback={fallback}><Suspense fallback={null}><LoadedLayer layer={layer} opacity={opacity} selectedNames={selectedNames} onSelect={onSelect} isolated={isolated} poses={poses} explosion={explosion} onReady={onReady}/></Suspense></AtlasBoundary>;
}
