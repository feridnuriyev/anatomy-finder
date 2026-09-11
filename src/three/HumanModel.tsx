import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { placeholderGeometry } from "../anatomy/placeholderGeometry";
import { layerOpacity, layers, currentLayer } from "../anatomy/depth";
import { structures as placeholderStructures } from "../data/placeholderStructures";
import { atlasManifest } from "../data/atlasManifest";
import { catalogCameraDistance, catalogLayout } from "../anatomy/catalogLayout";
import { StructureMesh } from "./StructureMesh";
import { AtlasLayer } from "./AtlasLayer";
import { CameraRig } from "./CameraRig";
import type { Layer } from "../types/anatomy";
import type { Vec3 } from "../types/anatomy";
import type { QuaternionTuple } from "../components/OrientationGizmo";
const EMPTY:string[]=[];
const grouped=layers.map(layer=>({layer,items:placeholderGeometry.filter(geometry=>placeholderStructures.find(s=>s.id===geometry.id)?.layer===layer)}));
export function HumanModel({depth,selectedId,isolated,onSelect,visibleLayers,explosion,resetKey,onOrientationChange}:{depth:number;selectedId?:string;isolated:boolean;onSelect:(id:string)=>void;visibleLayers:Layer[]|null;explosion:number;resetKey:number;onOrientationChange:(quaternion:QuaternionTuple)=>void}) {
  const size=useThree(state=>state.size);
  const selected=atlasManifest.structures.find(s=>s.id===selectedId);
  const activeLayer=currentLayer(depth);
  const activeKey=visibleLayers?.join(",")??activeLayer;
  const layout=useMemo(()=>catalogLayout(atlasManifest.structures.filter(s=>!s.isGroup && activeKey.split(",").includes(s.layer)),size.width/size.height),[activeKey,size.width,size.height]);
  const focusTarget=useMemo<Vec3>(()=>{
    if(!selected)return [0,.15,0];
    const concrete=selected.bounds?[selected]:selected.meshNames.map(name=>atlasManifest.structures.find(item=>item.id===name)).filter((item):item is typeof atlasManifest.structures[number]=>Boolean(item?.bounds));
    if(!concrete.length)return [0,.15,0];
    const bounds:Vec3[]=[
      [Math.min(...concrete.map(item=>item.bounds![0][0])),Math.min(...concrete.map(item=>item.bounds![0][1])),Math.min(...concrete.map(item=>item.bounds![0][2]))],
      [Math.max(...concrete.map(item=>item.bounds![1][0])),Math.max(...concrete.map(item=>item.bounds![1][1])),Math.max(...concrete.map(item=>item.bounds![1][2]))],
    ];
    const center=bounds[0].map((value,index)=>(value+bounds[1][index])/2) as Vec3;
    const pose=layout.poses[selected.id];
    if(!pose)return center;
    const scale=1+(pose.scale-1)*explosion;
    return center.map((value,index)=>pose.position[index]*explosion+value*scale) as Vec3;
  },[selected,layout,explosion]);
  const catalogDistance=catalogCameraDistance(layout,size.width/size.height);
  const distance=isolated?9.2:9.2+(Math.max(9.2,catalogDistance)-9.2)*explosion;
  return <><group>{grouped.map(({layer,items},index)=>{
    const opacity=visibleLayers?(visibleLayers.includes(layer)?1:0):layerOpacity(layer,depth);
    const selectedNames=selected?.layer===layer?selected.meshNames:EMPTY;
    return <group key={layer} name={layer}><AtlasLayer layer={layer} opacity={opacity} selectedNames={selectedNames} isolated={isolated} onSelect={onSelect} shouldLoad={visibleLayers?visibleLayers.includes(layer):depth>=index*25-18} poses={layout.poses} explosion={explosion} fallback={<group>{items.map(geometry=><StructureMesh key={geometry.id} geometry={geometry} opacity={isolated?(geometry.id===selectedId?1:0):opacity} selected={geometry.id===selectedId} onSelect={onSelect}/>)}</group>}/></group>;
  })}</group><CameraRig resetKey={resetKey} distance={distance} catalog={explosion>.05} target={selected?focusTarget:undefined} onOrientationChange={onOrientationChange}/></>;
}
