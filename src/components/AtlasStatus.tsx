import { useGLTF } from "@react-three/drei";
import { atlasManifest } from "../data/atlasManifest";
import { useAtlasStatus } from "../hooks/useAtlasStatus";
import type { Layer } from "../types/anatomy";

export function AtlasStatus({layer,activeLayers}:{layer:Layer;activeLayers:Layer[]|null}) {
  const {statuses,retry}=useAtlasStatus();
  const active=activeLayers??[layer];
  const failed=active.filter(item=>statuses[item]==="fallback");
  const loading=active.filter(item=>statuses[item]==="loading"||statuses[item]==="idle");
  const status=failed.length?"fallback":loading.length?"loading":"ready";
  const structureCount=active.reduce((sum,item)=>sum+atlasManifest.layers[item].structureCount,0);
  return <div className={`atlas-status ${status==="fallback"?"asset-failed":""}`} role="status" aria-live="polite">
    {!active.length?"No systems visible":status==="ready"?<><span className="status-dot"/>BodyParts3D <span>· {structureCount} {structureCount===1?"structure":"structures"}</span></>:status==="fallback"?<><span>Preview geometry · {failed.join(", ")} unavailable</span><button onClick={()=>{for(const item of failed){useGLTF.clear(atlasManifest.layers[item].url);retry(item);}}}>Retry</button></>:<><span className="loading-dot"/>Loading {loading.join(", ")}…</>}
  </div>;
}
