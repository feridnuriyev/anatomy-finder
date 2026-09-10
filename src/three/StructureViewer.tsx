import { Canvas } from "@react-three/fiber";
import { atlasManifest } from "../data/atlasManifest";
import { Lighting } from "./AnatomyViewer";
import { SceneBoundary } from "../components/SceneBoundary";
import { AtlasInspection } from "./AtlasInspection";
export function StructureViewer({id}:{id:string}) {
  const structure=atlasManifest.structures.find(item=>item.id===id);
  if(!structure)return <p className="scene-error">This structure’s model is unavailable.</p>;
  return <SceneBoundary><Canvas frameloop="demand" camera={{position:[0,0,6],fov:40}} dpr={[1,1.5]}><Lighting/><AtlasInspection structure={structure}/></Canvas></SceneBoundary>;
}
